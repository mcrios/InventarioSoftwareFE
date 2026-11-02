export interface NavItem {
  label: string;
  href: string;
  icon: string;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export const navigation: NavSection[] = [
  {
    label: "Principales",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
      {
        label: "Inventario de Equipos",
        href: "/inventory",
        icon: "devices",
      },
    ],
  },
  {
    label: "Operaciones",
    items: [
      {
        label: "Software y Parches",
        href: "/software",
        icon: "system_update_alt",
      },
      {
        label: "Aprobaciones",
        href: "/approvals",
        icon: "verified_user",
      },
      {
        label: "Gestión de Licencias",
        href: "/licenses",
        icon: "key",
      },
      {
        label: "Alertas",
        href: "/alerts",
        icon: "notifications_active",
      },
    ],
  },
  {
    label: "Administración",
    items: [
      { label: "Usuarios", href: "/users", icon: "group" },
      { label: "Configuración", href: "/settings", icon: "settings" },
    ],
  },
];
