"use client";

import { useCallback, useEffect, useState } from "react";
import { ComponentIcon } from "@/components/component-icon";
import {
  componentLabel,
  overallLabel,
  overallSubcopy,
  statusBadge,
  statusDot,
  statusGlow,
  statusRing,
  statusTone,
} from "@/lib/labels";
import type { ComponentId, ComponentStatus, OverallStatus, StatusPayload } from "@/lib/types";

const POLL_MS = 60_000;

const GROUPS: { title: string; ids: ComponentId[]; viaApi?: boolean }[] = [
  { title: "Servicios", ids: ["web", "api", "shortlinks"] },
  // Their latency is the API health request's, so showing it per row would be misleading.
  { title: "Infraestructura", ids: ["mongo", "redis"], viaApi: true },
];

function SignalBars({ status, latencyMs }: { status: ComponentStatus; latencyMs: number }) {
  const filled = status === "outage" ? 0 : latencyMs < 800 ? 3 : latencyMs < 2500 ? 2 : 1;
  return (
    <span className="flex h-3 items-end gap-[2px]" aria-hidden>
      {[1, 2, 3].map((n) => (
        <span
          key={n}
          className={`w-[3px] rounded-full ${n <= filled ? statusDot(status) : "bg-white/10"}`}
          style={{ height: `${n * 33}%` }}
        />
      ))}
    </span>
  );
}

function StatusGlyph({ status }: { status: OverallStatus }) {
  return (
    <div
      className={`relative grid size-12 shrink-0 place-items-center rounded-2xl border md:size-14 ${statusBadge(status)}`}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" fill="none" className="size-6 md:size-7">
        {status === "operational" ? (
          <path
            d="m5 12.5 4.5 4.5L19 7.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : status === "degraded" ? (
          <path d="M12 7v6M12 16.5v.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        ) : (
          <path d="m7 7 10 10M17 7 7 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        )}
      </svg>
    </div>
  );
}

function formatWhen(iso: string) {
  try {
    return new Intl.DateTimeFormat("es-ES", {
      dateStyle: "medium",
      timeStyle: "medium",
      timeZone: "Europe/Madrid",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function StatusBoard({ initial }: { initial: StatusPayload }) {
  const [data, setData] = useState(initial);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/status", { cache: "no-store" });
      const json = (await res.json()) as StatusPayload;
      setData(json);
    } catch {
      /* keep last known */
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      void refresh();
    }, POLL_MS);
    return () => window.clearInterval(id);
  }, [refresh]);

  const upCount = data.components.filter((c) => c.status === "operational").length;

  return (
    <div className="relative flex flex-1 flex-col">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 transition-[background] duration-700"
        style={{
          background: `radial-gradient(ellipse 75% 50% at 50% -5%, ${statusGlow(data.overall)}, transparent 58%), radial-gradient(ellipse 45% 35% at 85% 80%, rgb(96 165 250 / 6%), transparent 50%), linear-gradient(180deg, #0a0a0c 0%, #0c0f0e 48%, #0a0a0c 100%)`,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.3]"
        style={{
          backgroundImage:
            "linear-gradient(rgb(255 255 255 / 3.5%) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255 / 3.5%) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse 70% 55% at 50% 20%, black, transparent)",
        }}
      />

      <header className="rise border-b border-border/70">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-5 py-4 md:px-8">
          <a href="https://zendeal.io" className="min-w-0" aria-label="Zendeal">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-completo.svg"
              alt="Zendeal"
              width={500}
              height={54}
              className="h-3.5 w-auto object-contain object-left"
            />
          </a>
          <div className="flex items-center gap-3">
            <span className="hidden text-[11px] font-medium uppercase tracking-[0.14em] text-muted sm:inline">
              Status
            </span>
            <a
              href="https://zendeal.io"
              className="rounded-lg border border-border bg-surface/60 px-2.5 py-1.5 text-xs text-muted transition-colors hover:border-white/15 hover:text-foreground"
            >
              Ir a la app
            </a>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-3xl flex-1 px-5 py-10 md:px-8 md:py-14">
        <section
          className={`rise relative overflow-hidden rounded-2xl border border-border bg-surface/80 px-5 py-7 ring-1 backdrop-blur-sm md:px-8 md:py-8 ${statusRing(data.overall)}`}
          style={{ animationDelay: "60ms" }}
          aria-live="polite"
        >
          <div className="flex items-start gap-4 md:gap-5">
            <StatusGlyph status={data.overall} />
            <div className="min-w-0 flex-1 pt-0.5">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em] ${statusBadge(data.overall)}`}
              >
                <span className={`size-1.5 rounded-full pulse-dot ${statusDot(data.overall)}`} aria-hidden />
                Estado actual
              </span>
              <h1 className="font-display mt-2.5 text-[1.5rem] font-semibold leading-tight tracking-tight text-foreground md:text-[1.9rem]">
                {overallLabel(data.overall)}
              </h1>
              <p className="mt-1.5 max-w-md text-sm leading-6 text-muted">
                {overallSubcopy(data.overall)}
              </p>
            </div>
          </div>

          <div className="mt-7">
            <div className="mb-2 flex items-baseline justify-between gap-3 text-[11px]">
              <p className="text-muted">
                <span className={`font-medium tabular-nums ${statusTone(data.overall)}`}>
                  {upCount} de {data.components.length}
                </span>{" "}
                servicios funcionando
              </p>
            </div>
            <div
              className="grid gap-1"
              style={{ gridTemplateColumns: `repeat(${data.components.length}, minmax(0, 1fr))` }}
              role="img"
              aria-label={`${upCount} de ${data.components.length} servicios funcionando`}
            >
              {data.components.map((c) => (
                <div key={c.id} className="group/seg relative">
                  <div
                    className={`h-1.5 rounded-full transition-colors duration-500 ${statusDot(c.status)} ${c.status === "operational" ? "opacity-80" : ""}`}
                  />
                  <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-surface-elevated px-2 py-1 text-[10px] text-foreground opacity-0 shadow-lg transition-opacity group-hover/seg:opacity-100">
                    {c.name} · {componentLabel(c.status)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-[11px] text-muted">
            <p>
              Actualizado{" "}
              <time dateTime={data.updatedAt} className="text-foreground/75">
                {formatWhen(data.updatedAt)}
              </time>
              <span className="hidden sm:inline"> · se comprueba cada 60 s</span>
            </p>
            <button
              type="button"
              onClick={() => void refresh()}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-elevated px-2.5 py-1.5 text-xs text-muted transition-colors hover:border-white/15 hover:text-foreground disabled:opacity-60"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className={`size-3.5 ${refreshing ? "animate-spin" : ""}`}
                aria-hidden
              >
                <path
                  d="M20 12a8 8 0 1 1-2.34-5.66M20 4v4h-4"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {refreshing ? "Comprobando…" : "Actualizar"}
            </button>
          </div>
        </section>

        <div className="rise mt-9 space-y-6" style={{ animationDelay: "140ms" }}>
          {GROUPS.map((group) => {
            const items = data.components.filter((c) => group.ids.includes(c.id));
            if (items.length === 0) return null;
            const up = items.filter((c) => c.status === "operational").length;
            return (
              <section key={group.title}>
                <div className="mb-2.5 flex items-baseline justify-between gap-3 px-1">
                  <h2 className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
                    {group.title}
                  </h2>
                  <p className="text-[11px] tabular-nums text-muted">
                    {up}/{items.length} operativos
                  </p>
                </div>
                <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface/80 backdrop-blur-sm">
                  {items.map((c) => (
                    <li
                      key={c.id}
                      className="flex items-center gap-3.5 px-4 py-3.5 transition-colors hover:bg-white/[0.02] md:px-5"
                    >
                      <div className="relative grid size-9 shrink-0 place-items-center rounded-xl border border-border bg-surface-elevated">
                        <ComponentIcon id={c.id} />
                        {c.status !== "operational" ? (
                          <span
                            className={`absolute -right-0.5 -top-0.5 size-2.5 rounded-full ring-2 ring-surface ${statusDot(c.status)}`}
                            aria-hidden
                          />
                        ) : null}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">{c.name}</p>
                        {c.message ? (
                          <p className={`mt-0.5 truncate text-xs ${statusTone(c.status)}`}>
                            {c.message}
                          </p>
                        ) : (
                          <p className="mt-0.5 truncate text-xs text-muted">{c.description}</p>
                        )}
                      </div>

                      <div className="hidden shrink-0 items-center gap-2 sm:flex">
                        {group.viaApi ? (
                          <span className="text-[11px] text-muted">vía API</span>
                        ) : c.latencyMs != null ? (
                          <>
                            <span className="font-mono text-[11px] tabular-nums text-muted">
                              {c.latencyMs} ms
                            </span>
                            <SignalBars status={c.status} latencyMs={c.latencyMs} />
                          </>
                        ) : null}
                      </div>

                      <span
                        className={`inline-flex w-[5.75rem] shrink-0 items-center justify-center gap-1.5 rounded-full border px-2 py-1 text-[11px] font-medium ${statusBadge(c.status)}`}
                      >
                        <span className={`size-1.5 rounded-full ${statusDot(c.status)}`} aria-hidden />
                        {componentLabel(c.status)}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>

        <footer
          className="rise mt-12 flex flex-col gap-4 border-t border-border pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between"
          style={{ animationDelay: "280ms" }}
        >
          <div className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.svg" alt="" width={18} height={18} className="size-[18px] opacity-80" />
            <p>
              Monitorización automática de{" "}
              <a href="https://zendeal.io" className="text-foreground/80 hover:text-foreground">
                Zendeal
              </a>
            </p>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <a href="https://zendeal.io/support" className="hover:text-foreground">
              Soporte
            </a>
            <a href="/api/status" className="hover:text-foreground">
              API JSON
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
