"use client";

import { useCallback, useEffect, useState } from "react";
import { ComponentIcon } from "@/components/component-icon";
import {
  componentLabel,
  latencyColor,
  latencyPct,
  overallLabel,
  overallSubcopy,
  statusDot,
  statusGlow,
  statusRing,
  statusTone,
} from "@/lib/labels";
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
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2.5">
                <span
                  className={`size-2.5 shrink-0 rounded-full pulse-dot ${statusDot(data.overall)}`}
                  aria-hidden
                />
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
                  Estado global
                </p>
              </div>
              <h1
                className={`font-display mt-3 text-[1.65rem] font-semibold tracking-tight md:text-[2rem] ${statusTone(data.overall)}`}
              >
                {overallLabel(data.overall)}
              </h1>
              <p className="mt-2 max-w-md text-sm leading-6 text-muted">
                {overallSubcopy(data.overall)}
              </p>
            </div>

            <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
              <button
                type="button"
                onClick={() => void refresh()}
                disabled={refreshing}
                className="rounded-lg border border-border bg-surface-elevated px-3 py-1.5 text-xs text-muted transition-colors hover:border-white/15 hover:text-foreground disabled:opacity-60"
              >
                {refreshing ? "Comprobando…" : "Actualizar"}
              </button>
              <p className="text-[11px] text-muted">
                {upCount}/{data.components.length} operativos
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border pt-4 text-[11px] text-muted">
            <span>
              Actualizado{" "}
              <time dateTime={data.updatedAt} className="text-foreground/75">
                {formatWhen(data.updatedAt)}
              </time>
            </span>
            <span className="hidden text-border sm:inline" aria-hidden>
              ·
            </span>
            <span>Auto cada 60 s</span>
          </div>
        </section>

        <section className="rise mt-9" style={{ animationDelay: "140ms" }}>
          <div className="mb-3 flex items-end justify-between gap-3">
            <h2 className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
              Componentes
            </h2>
            <p className="text-[11px] text-muted">Latencia de la última prueba</p>
          </div>

          <ul className="overflow-hidden rounded-2xl border border-border bg-surface/80 backdrop-blur-sm">
            {data.components.map((c, i) => {
              const pct = latencyPct(c.latencyMs);
              return (
                <li
                  key={c.id}
                  className="group border-b border-border last:border-b-0"
                  style={{ animationDelay: `${180 + i * 40}ms` }}
                >
                  <div className="flex items-center gap-3.5 px-4 py-4 transition-colors hover:bg-white/[0.02] md:px-5">
                    <div className="grid size-9 shrink-0 place-items-center rounded-xl border border-border bg-surface-elevated">
                      <ComponentIcon id={c.id} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">{c.name}</p>
                        <span
                          className={`size-1.5 rounded-full ${statusDot(c.status)}`}
                          aria-hidden
                        />
                      </div>
                      <p className="mt-0.5 truncate text-xs text-muted">
                        {c.description}
                        {c.message ? ` · ${c.message}` : ""}
                      </p>
                      {c.latencyMs != null ? (
                        <div
                          className="mt-2.5 h-0.5 max-w-[12rem] overflow-hidden rounded-full bg-white/[0.06]"
                          aria-hidden
                        >
                          <div
                            className="latency-bar h-full rounded-full transition-[width] duration-500"
                            style={
                              {
                                width: `${Math.max(pct, c.status === "outage" ? 100 : 4)}%`,
                                ["--bar-color" as string]: latencyColor(c.status),
                              } as React.CSSProperties
                            }
                          />
                        </div>
                      ) : null}
                    </div>

                    <div className="shrink-0 text-right">
                      <p className={`text-xs font-medium ${statusTone(c.status)}`}>
                        {componentLabel(c.status)}
                      </p>
                      {c.latencyMs != null ? (
                        <p className="mt-0.5 font-mono text-[10px] tabular-nums text-muted">
                          {c.latencyMs} ms
                        </p>
                      ) : (
                        <p className="mt-0.5 text-[10px] text-muted">—</p>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

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
