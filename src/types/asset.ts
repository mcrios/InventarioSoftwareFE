export type AssetCategory = "physical" | "virtual" | "cloud";

export type AssetStatusTone = "success" | "warning" | "danger" | "maintenance";

export interface AssetOwner {
  name: string;
  initials: string;
  role: string;
  avatar: "primary" | "neutral";
}

export interface AssetStatus {
  label: string;
  tone: AssetStatusTone;
  icon?: string;
}

export interface Asset {
  id: string;
  hostname: string;
  model: string;
  modelTone: "neutral" | "danger";
  serial: string;
  ip: string;
  segment: string;
  os: string;
  specs: string;
  osAlert: boolean;
  icon: string;
  owner: AssetOwner;
  status: AssetStatus;
  category: AssetCategory;
  alert: boolean;
  action: {
    label: string;
    tone: "primary" | "secondary";
  };
}

export type FleetStatTone =
  | "neutral"
  | "primary"
  | "secondary"
  | "warning"
  | "danger";

export interface FleetStat {
  id: string;
  label: string;
  icon: string;
  value: string;
  detail: string;
  progress: number;
  tone: FleetStatTone;
}

export type TelemetryTone = "success" | "danger" | "neutral";

export interface TelemetryEvent {
  id: string;
  host: string;
  message: string;
  time: string;
  tone: TelemetryTone;
}

export interface ManufacturerShare {
  id: string;
  name: string;
  nodes: string;
  percentage: number;
  color: string;
  dashOffset: number;
}
