export const SITE = {
  brand: "Zendeal",
  statusUrl: "https://status.zendeal.io",
  siteUrl: "https://zendeal.io",
} as const;

export const TARGETS = {
  web: process.env.CHECK_WEB_URL ?? "https://zendeal.io",
  apiHealth: process.env.CHECK_API_HEALTH_URL ?? "https://api.zendeal.io/v1/health",
  shortlinks: process.env.CHECK_SHORTLINKS_URL ?? "https://zdeal.link/",
} as const;

/** Soft latency threshold (ms) — above this the check is degraded even if OK. */
export const LATENCY_DEGRADED_MS = Number(process.env.LATENCY_DEGRADED_MS ?? 2500);
