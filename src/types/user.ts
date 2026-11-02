export type UserRole =
  | "Administrador"
  | "SecOps"
  | "DevOps"
  | "Finanzas"
  | "Soporte";

export type UserStatus = "Activo" | "Invitado" | "Suspendido";

export interface User {
  id: string;
  name: string;
  initials: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastAccess: string;
}

export interface CurrentUser {
  name: string;
  fullName: string;
  initials: string;
  role: string;
}
