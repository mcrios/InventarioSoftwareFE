import type { CurrentUser, User } from "@/types/user";

export const currentUser: CurrentUser = {
  name: "Mauricio C.",
  fullName: "Mauricio Cruz",
  initials: "MC",
  role: "TPM",
};

export const users: User[] = [
  {
    id: "usr-001",
    name: "Alejandro Ramos",
    initials: "AR",
    email: "alejandro.ramos@opscore.io",
    role: "SecOps",
    status: "Activo",
    lastAccess: "Hace 2 min",
  },
  {
    id: "usr-002",
    name: "Sofia Méndez",
    initials: "SM",
    email: "sofia.mendez@opscore.io",
    role: "DevOps",
    status: "Activo",
    lastAccess: "Hace 18 min",
  },
  {
    id: "usr-003",
    name: "Carlos Vega",
    initials: "CV",
    email: "carlos.vega@opscore.io",
    role: "DevOps",
    status: "Activo",
    lastAccess: "Hace 1 h",
  },
  {
    id: "usr-004",
    name: "Lucía Torres",
    initials: "LT",
    email: "lucia.torres@opscore.io",
    role: "Soporte",
    status: "Activo",
    lastAccess: "Hace 3 h",
  },
  {
    id: "usr-005",
    name: "Marcos Blanco",
    initials: "MB",
    email: "marcos.blanco@opscore.io",
    role: "Finanzas",
    status: "Invitado",
    lastAccess: "Sin acceso",
  },
  {
    id: "usr-006",
    name: "Valeria Ortiz",
    initials: "VO",
    email: "valeria.ortiz@opscore.io",
    role: "Administrador",
    status: "Activo",
    lastAccess: "Ayer",
  },
  {
    id: "usr-007",
    name: "Diego Ramírez",
    initials: "DR",
    email: "diego.ramirez@opscore.io",
    role: "Soporte",
    status: "Suspendido",
    lastAccess: "Hace 12 días",
  },
  {
    id: "usr-008",
    name: "Elena Navarro",
    initials: "EN",
    email: "elena.navarro@opscore.io",
    role: "Administrador",
    status: "Activo",
    lastAccess: "Hoy 09:12",
  },
];


export const authService = {

  create: async ()=>{
    
  }
}