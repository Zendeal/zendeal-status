import type { ComponentId, ComponentStatus, OverallStatus } from "./types";

export function overallLabel(status: OverallStatus): string {
  switch (status) {
    case "operational":
      return "Todo funciona correctamente";
    case "degraded":
      return "Algunos servicios van lentos";
    case "outage":
      return "Hay una incidencia en curso";
  }
}

export function overallSubcopy(status: OverallStatus): string {
  switch (status) {
    case "operational":
      return "Pagos, panel y enlaces están disponibles con normalidad.";
    case "degraded":
      return "Puedes seguir usando Zendeal, aunque algunas acciones pueden tardar más.";
    case "outage":
      return "Estamos trabajando en ello. Puede afectar a cobros o al acceso al panel.";
  }
}

export function statusBadge(status: ComponentStatus | OverallStatus): string {
  switch (status) {
    case "operational":
      return "border-success/25 bg-success/10 text-success";
    case "degraded":
      return "border-warning/25 bg-warning/10 text-warning";
    case "outage":
      return "border-danger/25 bg-danger/10 text-danger";
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
