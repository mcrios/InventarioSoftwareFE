import type { BadgeTone } from "@/components/ui/Badge";
import type { Equipo } from "@/types/api";

export interface EquipmentHealthMeta {
  label: string;
  tone: BadgeTone;
  icon: string;
}

const healthRules: Array<{
  pattern: RegExp;
  tone: BadgeTone;
  icon: string;
}> = [
  {
    pattern: /(cr[ií]tic|falla|error|malo|da[ñn]ado|aver[ií]a)/i,
    tone: "danger",
    icon: "error",
  },
  {
    pattern: /(mantenimiento|revisi[oó]n|regular|alerta|advertencia|pendiente)/i,
    tone: "warning",
    icon: "warning",
  },
  {
    pattern: /(óptimo|optimo|bueno|operativo|activo|saludable|estable|excelente)/i,
    tone: "success",
    icon: "check_circle",
  },
];

/** Interpreta el estado de salud libre que guarda el backend. */
export function getEquipmentHealthMeta(
  salud: string | null | undefined,
): EquipmentHealthMeta {
  const value = (salud ?? "").trim();

  if (!value) {
    return { label: "Sin estado", tone: "neutral", icon: "monitor_heart" };
  }

  const rule = healthRules.find((item) => item.pattern.test(value));

  return {
    label: value,
    tone: rule?.tone ?? "neutral",
    icon: rule?.icon ?? "monitor_heart",
  };
}

export function getEquipmentIcon(tipo: string | null | undefined) {
  const value = (tipo ?? "").toLowerCase();

  if (/(laptop|port[aá]til|notebook)/.test(value)) return "laptop_mac";
  if (/(escritorio|desktop|pc|torre)/.test(value)) return "desktop_windows";
  if (/(servidor|server|rack)/.test(value)) return "dns";
  if (/(switch|conmutador)/.test(value)) return "router";
  if (/(router|enrutador|firewall)/.test(value)) return "settings_ethernet";
  if (/(impresora|printer|scanner|esc[aá]ner)/.test(value)) return "print";
  if (/(m[oó]vil|telefono|tel[eé]fono|tablet|celular)/.test(value))
    return "smartphone";
  if (/(cam[aá]ra|proyector|tv|monitor)/.test(value)) return "videocam";

  return "devices";
}

/** Tipos sugeridos en el formulario; el backend acepta cualquier texto. */
export const EQUIPMENT_TYPES = [
  "Laptop",
  "Escritorio",
  "Servidor",
  "Switch",
  "Router",
  "Impresora",
  "Móvil",
  "Otro",
] as const;

/** Estados sugeridos en el formulario; el backend acepta cualquier texto. */
export const HEALTH_STATES = [
  "Óptimo",
  "Bueno",
  "Regular",
  "En mantenimiento",
  "Crítico",
] as const;

export function collectEquipmentTypes(equipos: Equipo[]) {
  const values = new Set<string>();

  equipos.forEach((equipo) => {
    const tipo = equipo.tipo?.trim();

    if (tipo) values.add(tipo);
  });

  return Array.from(values).sort((a, b) => a.localeCompare(b, "es"));
}
