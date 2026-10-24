import { LATENCY_DEGRADED_MS, TARGETS } from "./config";
import type {
  ComponentResult,
  ComponentStatus,
  OverallStatus,
  StatusPayload,
} from "./types";

const TIMEOUT_MS = 8_000;

type HttpProbe = {
  ok: boolean;
  statusCode: number | null;
  latencyMs: number;
  body: unknown;
  error?: string;
};

async function probeHttp(url: string, opts?: { acceptRedirect?: boolean }): Promise<HttpProbe> {
  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: opts?.acceptRedirect === false ? "manual" : "follow",
      cache: "no-store",
      signal: controller.signal,
      headers: {
        Accept: "application/json, text/html, */*",
        "User-Agent": "ZendealStatus/1.0 (+https://status.zendeal.io)",
      },
    });

    const latencyMs = Date.now() - started;
    let body: unknown = null;
    const ct = res.headers.get("content-type") ?? "";
    if (ct.includes("application/json")) {
      try {
        body = await res.json();
      } catch {
        body = null;
      }
    } else {
      await res.arrayBuffer().catch(() => undefined);
    }

    const redirectedOk = res.type === "opaqueredirect" || (res.status >= 300 && res.status < 400);
    const ok = res.ok || (opts?.acceptRedirect && redirectedOk);

    return {
      ok: Boolean(ok),
      statusCode: res.status,
      latencyMs,
      body,
    };
  } catch (err) {
    return {
      ok: false,
      statusCode: null,
      latencyMs: Date.now() - started,
      body: null,
      error: err instanceof Error ? err.message : "request failed",
    };
  } finally {
    clearTimeout(timer);
  }
}

function statusFromLatency(ok: boolean, latencyMs: number): ComponentStatus {
  if (!ok) return "outage";
  if (latencyMs >= LATENCY_DEGRADED_MS) return "degraded";
  return "operational";
}

function overallFrom(components: ComponentResult[]): OverallStatus {
  if (components.some((c) => c.status === "outage")) return "outage";
  if (components.some((c) => c.status === "degraded")) return "degraded";
  return "operational";
}

type ApiHealthBody = {
  ok?: boolean;
  checks?: { api?: boolean; mongo?: boolean; redis?: boolean };
};

export async function runChecks(): Promise<StatusPayload> {
  const [web, api, shortlinks] = await Promise.all([
    probeHttp(TARGETS.web),
    probeHttp(TARGETS.apiHealth),
    probeHttp(TARGETS.shortlinks, { acceptRedirect: true }),
  ]);

  const health = (api.body ?? {}) as ApiHealthBody;
  const mongoOk = Boolean(api.ok && health.checks?.mongo);
  const redisOk = Boolean(api.ok && health.checks?.redis);
  const apiProcessOk = Boolean(api.ok && (health.ok ?? health.checks?.api ?? true));

  const components: ComponentResult[] = [
    {
      id: "web",
      name: "Web",
      description: "zendeal.io",
      status: statusFromLatency(web.ok, web.latencyMs),
      latencyMs: web.latencyMs,
      message: web.ok ? undefined : web.error ?? `HTTP ${web.statusCode ?? "—"}`,
    },
    {
      id: "api",
      name: "API",
      description: "api.zendeal.io",
      status: statusFromLatency(apiProcessOk, api.latencyMs),
      latencyMs: api.latencyMs,
      message: apiProcessOk ? undefined : api.error ?? `HTTP ${api.statusCode ?? "—"}`,
    },
    {
      id: "shortlinks",
      name: "Enlaces cortos",
      description: "zdeal.link",
      status: statusFromLatency(shortlinks.ok, shortlinks.latencyMs),
      latencyMs: shortlinks.latencyMs,
      message: shortlinks.ok
        ? undefined
        : shortlinks.error ?? `HTTP ${shortlinks.statusCode ?? "—"}`,
    },
    {
      id: "mongo",
      name: "MongoDB",
      description: "Base de datos",
      status: mongoOk ? "operational" : api.ok ? "outage" : "outage",
      latencyMs: api.ok ? api.latencyMs : null,
      message: mongoOk
        ? undefined
        : api.ok
          ? "Ping fallido"
          : "No se pudo consultar el health de la API",
    },
    {
      id: "redis",
      name: "Redis",
      description: "Caché y colas",
      status: redisOk ? "operational" : "outage",
      latencyMs: api.ok ? api.latencyMs : null,
      message: redisOk
        ? undefined
        : api.ok
          ? "Ping fallido"
          : "No se pudo consultar el health de la API",
    },
  ];

  // If API is down, mongo/redis are unknown — mark degraded rather than false outage noise
  if (!api.ok) {
    for (const id of ["mongo", "redis"] as const) {
      const row = components.find((c) => c.id === id);
      if (row) {
        row.status = "degraded";
        row.message = "Desconocido (API sin respuesta)";
      }
    }
  }

  return {
    overall: overallFrom(components),
    updatedAt: new Date().toISOString(),
    components,
  };
}
