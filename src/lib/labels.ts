import type { ComponentStatus, OverallStatus } from "./types";

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
      return "bg-success";
    case "degraded":
      return "bg-warning";
    case "outage":
      return "bg-danger";
  }
}
