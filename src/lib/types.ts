export type ComponentStatus = "operational" | "degraded" | "outage";

export type OverallStatus = "operational" | "degraded" | "outage";

export type ComponentId = "web" | "api" | "shortlinks" | "mongo" | "redis";

export type ComponentResult = {
  id: ComponentId;
  name: string;
  description: string;
  status: ComponentStatus;
  latencyMs: number | null;
  message?: string;
};

export type StatusPayload = {
  overall: OverallStatus;
  updatedAt: string;
  components: ComponentResult[];
};
