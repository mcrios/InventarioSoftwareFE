/**
 * Tipos del API de Core Inventory.
 *
 * Fuente: contrato OpenAPI expuesto por el backend en
 * `GET http://localhost:8080/coreinventory/v3/api-docs` (versión 0.1).
 *
 * El contrato crudo se puede regenerar con `npm run generate:api-types` y queda
 * en `src/types/api.generated.ts`. Este archivo contiene la versión curada que
 * consume la aplicación (relaciones anulables y payloads de escritura).
 *
 * Convenciones:
 * - `id` y demás enteros de Java (`Long`, `Integer`) se representan como `number`.
 * - Las fechas (`OffsetDateTime`, `LocalDate`, `Date`) viajan como string ISO-8601.
 * - Las relaciones anidadas se envían/reciben como objetos completos; para crear o
 *   actualizar basta con enviar `{ id }` (ver `CreatePayload<T>`).
 * - Los campos que la base de datos permite nulos se tipan como `T | null`.
 */

// ---------------------------------------------------------------------------
// Envoltorio de respuestas y paginación
// ---------------------------------------------------------------------------

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface SortObject {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}

export interface PageableObject {
  offset: number;
  paged: boolean;
  pageNumber: number;
  pageSize: number;
  sort: SortObject;
  unpaged: boolean;
}

export interface Page<T> {
  totalPages: number;
  totalElements: number;
  size: number;
  content: T[];
  number: number;
  sort: SortObject;
  pageable: PageableObject;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

/** Parámetros de paginación aceptados por los listados de Spring Data. */
export interface PageableParams {
  /** Número de página, inicia en 0. */
  page?: number;
  /** Cantidad de registros por página. */
  size?: number;
  /** Orden, por ejemplo `["nombre,asc", "id,desc"]`. */
  sort?: string[];
}

export type ApiPageResponse<T> = ApiResponse<Page<T>>;
export type ApiListResponse<T> = ApiResponse<T[]>;

// ---------------------------------------------------------------------------
// Autenticación
// ---------------------------------------------------------------------------

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  email: string;
}

export interface AuthRolesData {
  email: string;
  authorities: { authority: string }[];
}

// ---------------------------------------------------------------------------
// Entidades
// ---------------------------------------------------------------------------

export interface Acceso {
  id: number;
  codigo: string;
  modulo: string;
  descripcion: string | null;
  path: string | null;
}

export interface Empresa {
  id: number;
  nombre: string;
  identificador: string | null;
  activo: boolean;
  fechaCreacion: string;
}

export interface Rol {
  id: number;
  nombre: string;
  descripcion: string | null;
  fechaCreacion: string;
  accesos: Acceso[];
}

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  /** Solo se usa al crear o actualizar; el backend nunca lo devuelve. */
  password?: string;
  activo: boolean;
  intentosFallidos: number;
  vencimientoClave: string | null;
  codigoAcceso: string | null;
  ultimoAcceso: string | null;
  fechaCreacion: string;
  roles: Rol[];
  empresas: Empresa[];
}

export interface TipoSoftware {
  id: number;
  nombre: string;
  descripcion: string | null;
}

export interface Licencia {
  id: number;
  empresa: Empresa;
  codigoClave: string | null;
  archivoUrl: string | null;
  cantidadTotal: number;
  cantidadUsada: number;
  fechaVencimiento: string | null;
}

export interface Software {
  id: number;
  licencia: Licencia;
  tipoSoftware: TipoSoftware;
  nombre: string;
  fabricante: string | null;
  versionActual: string;
  fechaActualizacion: string | null;
  fechaCreacion: string;
}

export interface Actualizacion {
  id: number;
  software: Software;
  versionOrigen: string | null;
  versionDestino: string;
  tipoCambio: string;
  descripcion: string | null;
  fechaLanzamiento: string;
}

export interface SolicitudActualizacion {
  id: number;
  empresa: Empresa;
  actualizacion: Actualizacion;
  solicitante: Usuario;
  aprobador: Usuario | null;
  estado: string;
  formatoDespliegue: string;
  fechaInicioRango: string;
  fechaFinRango: string;
  observaciones: string | null;
  fechaCreacion: string;
}

export interface Equipo {
  id: number;
  empresa: Empresa;
  responsable: Usuario | null;
  nombre: string;
  tipo: string;
  ubicacion: string | null;
  fabricante: string | null;
  ip: string | null;
  salud: string | null;
  fechaCreacion: string;
}

export interface SolicitudActualizacionEquipo {
  id: number;
  solicitud: SolicitudActualizacion;
  equipo: Equipo;
  estadoEjecucion: string;
  logResultado: string | null;
}

export interface EquipoSoftware {
  id: number;
  equipo: Equipo;
  software: Software;
  licencia: Licencia | null;
  versionInstalada: string;
  estadoOperativo: string;
  fechaInstalacion: string;
}

export interface Notificacion {
  id: number;
  usuario: Usuario;
  titulo: string;
  mensaje: string;
  tipo: string;
  leida: boolean;
  fechaCreacion: string;
}

export interface AuditLog {
  id: number;
  usuario: Usuario | null;
  accion: string;
  tablaAfectada: string | null;
  registroId: number | null;
  ipOrigen: string | null;
  fechaCreacion: string;
}

// ---------------------------------------------------------------------------
// Payloads de escritura
// ---------------------------------------------------------------------------

/** Referencia mínima a otra entidad, usada para relaciones ManyToMany. */
export interface EntityRef {
  id: number;
}

export interface EmpresaInput {
  nombre: string;
  identificador?: string | null;
  activo?: boolean;
}

export interface UsuarioInput {
  nombre: string;
  email: string;
  /** Solo en creación o cuando se desea cambiar la contraseña. */
  password?: string;
  activo?: boolean;
  roles?: EntityRef[];
  empresas?: EntityRef[];
}

export interface RolInput {
  nombre: string;
  descripcion?: string | null;
  accesos?: EntityRef[];
}

export type AccesoInput = Omit<Acceso, "id">;

export interface LicenciaInput {
  empresa: EntityRef;
  codigoClave?: string | null;
  archivoUrl?: string | null;
  cantidadTotal: number;
  cantidadUsada?: number;
  fechaVencimiento?: string | null;
}

export interface LicenciaRenovacionInput {
  fechaVencimiento: string;
  cantidadTotal?: number;
  codigoClave?: string | null;
}

/**
 * Convierte una entidad de respuesta en un payload de creación/actualización:
 * permite omitir cualquier campo y descarta los generados por el backend.
 */
export type CreatePayload<T extends { id: number }> = Omit<
  Partial<T>,
  "id" | "fechaCreacion" | "ultimoAcceso"
>;

// ---------------------------------------------------------------------------
// Alias de respuestas por recurso (equivalentes a los del contrato OpenAPI)
// ---------------------------------------------------------------------------

export type ApiResponseAcceso = ApiResponse<Acceso>;
export type ApiResponseActualizacion = ApiResponse<Actualizacion>;
export type ApiResponseAuditLog = ApiResponse<AuditLog>;
export type ApiResponseEmpresa = ApiResponse<Empresa>;
export type ApiResponseEquipo = ApiResponse<Equipo>;
export type ApiResponseEquipoSoftware = ApiResponse<EquipoSoftware>;
export type ApiResponseLicencia = ApiResponse<Licencia>;
export type ApiResponseLoginResponse = ApiResponse<LoginResponse>;
export type ApiResponseNotificacion = ApiResponse<Notificacion>;
export type ApiResponseRol = ApiResponse<Rol>;
export type ApiResponseSoftware = ApiResponse<Software>;
export type ApiResponseSolicitudActualizacion =
  ApiResponse<SolicitudActualizacion>;
export type ApiResponseSolicitudActualizacionEquipo =
  ApiResponse<SolicitudActualizacionEquipo>;
export type ApiResponseTipoSoftware = ApiResponse<TipoSoftware>;
export type ApiResponseUsuario = ApiResponse<Usuario>;

export type ApiResponsePageAcceso = ApiPageResponse<Acceso>;
export type ApiResponsePageActualizacion = ApiPageResponse<Actualizacion>;
export type ApiResponsePageAuditLog = ApiPageResponse<AuditLog>;
export type ApiResponsePageEmpresa = ApiPageResponse<Empresa>;
export type ApiResponsePageEquipo = ApiPageResponse<Equipo>;
export type ApiResponsePageEquipoSoftware = ApiPageResponse<EquipoSoftware>;
export type ApiResponsePageLicencia = ApiPageResponse<Licencia>;
export type ApiResponsePageNotificacion = ApiPageResponse<Notificacion>;
export type ApiResponsePageSoftware = ApiPageResponse<Software>;
export type ApiResponsePageSolicitudActualizacion =
  ApiPageResponse<SolicitudActualizacion>;
export type ApiResponsePageSolicitudActualizacionEquipo =
  ApiPageResponse<SolicitudActualizacionEquipo>;
export type ApiResponsePageUsuario = ApiPageResponse<Usuario>;

export type ApiResponseListAcceso = ApiListResponse<Acceso>;
export type ApiResponseListRol = ApiListResponse<Rol>;
export type ApiResponseListTipoSoftware = ApiListResponse<TipoSoftware>;
