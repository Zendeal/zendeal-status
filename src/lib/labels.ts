import type { ComponentId, ComponentStatus, OverallStatus } from "./types";

export function overallLabel(status: OverallStatus): string {
  switch (status) {
    case "operational":
      return "Todos los sistemas operativos";
    case "degraded":
      return "Rendimiento degradado";
    case "outage":
      return "Incidente en curso";
  }
}

export function overallSubcopy(status: OverallStatus): string {
  switch (status) {
    case "operational":
      return "Web, API, enlaces y datos responden con normalidad.";
    case "degraded":
      return "Algunos servicios van más lentos o parcialmente afectados.";
    case "outage":
      return "Hay un fallo que puede impedir cobros o el acceso al panel.";
  }
}

export function componentLabel(status: ComponentStatus): string {
  switch (status) {
    case "operational":
      return "Operativo";
    case "degraded":
      return "Degradado";
    case "outage":
      return "Caído";
  }
}

export function statusTone(status: ComponentStatus | OverallStatus): string {
  switch (status) {
    case "operational":
      return "text-success";
    case "degraded":
      return "text-warning";
    case "outage":
      return "text-danger";
  }
}

export function statusDot(status: ComponentStatus | OverallStatus): string {
  switch (status) {
    case "operational":
      return "bg-success text-success";
    case "degraded":
      return "bg-warning text-warning";
    case "outage":
      return "bg-danger text-danger";
  }
}

export function statusGlow(status: OverallStatus): string {
  switch (status) {
    case "operational":
      return "rgb(52 211 153 / 18%)";
    case "degraded":
      return "rgb(251 191 36 / 16%)";
    case "outage":
      return "rgb(248 113 113 / 16%)";
  }
}

export function statusRing(status: OverallStatus): string {
  switch (status) {
    case "operational":
      return "ring-success/25";
    case "degraded":
      return "ring-warning/25";
    case "outage":
      return "ring-danger/25";
  }
}

export function latencyColor(status: ComponentStatus): string {
  switch (status) {
    case "operational":
      return "var(--success)";
    case "degraded":
      return "var(--warning)";
    case "outage":
      return "var(--danger)";
  }
}

/** Latency bar width: 0–100 relative to a soft 3s ceiling. */
export function latencyPct(ms: number | null): number {
  if (ms == null || ms < 0) return 0;
  return Math.min(100, Math.round((ms / 3000) * 100));
}

export function componentIconLabel(id: ComponentId): string {
  switch (id) {
    case "web":
      return "Web";
    case "api":
      return "API";
    case "shortlinks":
      return "Links";
    case "mongo":
      return "DB";
    case "redis":
      return "Cache";
  }
}
