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
    label: "Administración",
    items: [
      { label: "Empresas", href: "/company", icon: "corporate_fare" },
      { label: "Usuarios", href: "/users", icon: "group" },
      { label: "Configuración", href: "/settings", icon: "settings" },
    ],
  },
  {
    label: "Operaciones",
    items: [
      {
        label: "Gestión de Licencias",
        href: "/licenses",
        icon: "key",
      },
      {
        label: "Software y Parches",
        href: "/software",
        icon: "system_update_alt",
      },
      {
        label: "Aprobar Actualizaciones",
        href: "/approvals",
        icon: "verified_user",
      },
      {
        label: "Notificaciones",
        href: "/notifications",
        icon: "notifications_active",
      },
    ],
  },
  
];
