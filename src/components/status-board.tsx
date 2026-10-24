"use client";

import { useCallback, useEffect, useState } from "react";
import { componentLabel, overallLabel, statusDot, statusTone } from "@/lib/labels";
import type { StatusPayload } from "@/lib/types";

const POLL_MS = 60_000;

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

  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-12 md:px-8 md:py-16">
      <header className="mb-10">
        <a
          href="https://zendeal.io"
          className="font-display text-sm font-semibold tracking-tight text-foreground/90 hover:text-foreground"
        >
          Zendeal
        </a>
        <p className="mt-1 text-xs text-muted">Estado del servicio</p>
      </header>

      <section
        className="rounded-2xl border border-border bg-surface px-5 py-6 md:px-7 md:py-7"
        aria-live="polite"
      >
        <div className="flex items-start gap-3">
          <span
            className={`mt-1.5 size-2.5 shrink-0 rounded-full pulse-dot ${statusDot(data.overall)}`}
            aria-hidden
          />
          <div className="min-w-0 flex-1">
            <h1 className={`font-display text-xl font-semibold tracking-tight md:text-2xl ${statusTone(data.overall)}`}>
              {overallLabel(data.overall)}
            </h1>
            <p className="mt-1.5 text-xs text-muted">
              Actualizado {formatWhen(data.updatedAt)}
              {refreshing ? " · comprobando…" : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void refresh()}
            className="shrink-0 rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted transition-colors hover:border-white/15 hover:text-foreground"
          >
            Actualizar
          </button>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-[11px] font-medium uppercase tracking-wider text-muted">
          Componentes
        </h2>
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
          {data.components.map((c) => (
            <li key={c.id} className="flex items-center gap-3 px-4 py-3.5 md:px-5">
              <span className={`size-2 shrink-0 rounded-full ${statusDot(c.status)}`} aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-foreground">{c.name}</p>
                <p className="text-xs text-muted">
                  {c.description}
                  {c.message ? ` · ${c.message}` : ""}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className={`text-xs font-medium ${statusTone(c.status)}`}>
                  {componentLabel(c.status)}
                </p>
                {c.latencyMs != null ? (
                  <p className="font-mono text-[10px] text-muted tabular-nums">{c.latencyMs} ms</p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <footer className="mt-12 flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
        <p>Comprobación automática cada minuto.</p>
        <a href="https://zendeal.io" className="hover:text-foreground">
          Volver a zendeal.io
        </a>
      </footer>
    </div>
  );
}
