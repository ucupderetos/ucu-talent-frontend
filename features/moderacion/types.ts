// Tipos del dominio: moderacion (Admin UCU).
//
// Las entidades core viven en @/types. Acá van las acciones de moderación.
//
// Estado de los endpoints de moderación (docs/ENDPOINTS.md):
//   - Cola de CUENTAS (empresas/alumnos): ✅ `PATCH /user/{id}` con
//     { status, adminComment } conectado en `use-review-account.ts`.
//   - Cola de VACANTES: ✅ `PUT /vacancy/status/{id}` (rol ADMIN,
//     `UpdateVacancyStatusAdminRequest`) EXISTE — el Admin mueve
//     `PUBLICADO ↔ PENDIENTE`, nunca a `FINALIZADO` (eso es exclusivo de la
//     empresa dueña vía `PATCH /vacancy/status/{id}`). Ver `ReviewVacancyInput`
//     en `use-review-vacancy.ts`, conectado al backend con ese criterio
//     (no hay un `VacancyResolution` acá: `VacancyStatus` no tiene `RECHAZADO`,
//     así que no hace falta un tipo de "decisión" aparte — el input es
//     directamente el `VacancyStatus` destino).

import type {
  AccountStatus,
  Area,
  Company,
  Degree,
  Department,
  DocumentType,
  Education,
  Modality,
  StudentProfile,
  User,
  Vacancy,
  VacancyApplication,
  VacancyApplicationStatus,
  VacancyStatus,
  WorkExperience,
} from "@/types";

/**
 * RF-13: aprobar o rechazar una empresa (o un alumno — `AccountStatus` es
 * genérico a los 3 roles, no solo a empresa). El campo cambió de forma: antes
 * era un booleano en `Company.approved` que no podía distinguir "rechazada"
 * de "todavía no revisada"; ahora `AccountStatus` en `User.status` sí lo
 * distingue. Wire: `PATCH /user/{id}` (A-02).
 */
export interface AccountResolution {
  userId: string;
  status: Extract<AccountStatus, "APROBADO" | "RECHAZADO">;
  /** Motivo del rechazo (o nota de la revisión). Wire: `adminComment` de
   *  `PATCH /user/{id}` (A-02) — el backend lo guarda en StudentProfile/Company
   *  y se lo muestra al usuario si el Admin lo registró. */
  adminComment?: string;
}

// ---------------------------------------------------------------------------
// Listado de "Usuarios" (alumnos) — RF-MOD-05 desde el lado del Admin.
// ---------------------------------------------------------------------------

/**
 * Fila de la tabla de alumnos: el `StudentProfile` del MER más los datos
 * derivados que la pantalla necesita mostrar (email/status/fecha de registro
 * vienen del `User` con la misma PK, carrera/facultad de `Education` →
 * `Degree` → `Area`). No es una entidad del MER, por eso vive acá y no en
 * `@/types`.
 */
export interface StudentRow
  extends Omit<StudentProfile, "documentType" | "documentNumber"> {
  email: string;
  status: AccountStatus;
  registeredAt: string; // ISO 8601
  degreeId: string | null;
  degreeName: string;
  areaId: string | null;
  areaName: string;
  // el alumno puede tener User (rol ALUMNO) sin haber completado
  // POST /student-profile todavia — no se puede exigir un DocumentType real.
  documentType: DocumentType | null;
  documentNumber: string;
  hasProfile: boolean;
  /**
   * Key de storage de la foto (`User.profileImage`), NO una URL — se canjea con
   * `useSignedProfileImageUrl`. `null` si nunca subió una.
   *
   * ⚠️ Va en la fila a propósito: el hook ya trae el `User` completo, así que la
   * key sale gratis. Si la tabla usara `useProfileImage(id)` en su lugar, cada
   * fila dispararía un `GET /user/{id}` extra solo para volver a leer este mismo
   * campo — el N+1 que A-24 (`docs/agents/open-questions.md`) decidió evitar.
   */
  profileImage: string | null;
}

/** Una formación del alumno con sus catálogos ya resueltos para el detalle.
 *  Conserva la entidad `Education` completa y agrega únicamente las relaciones
 *  que la vista necesita presentar. */
export interface AdminStudentEducation extends Education {
  degree: Degree | null;
  area: Area | null;
}

/** Detalle administrativo de un alumno. Combina las entidades reales que
 *  comparten la PK del usuario; no agrega campos de CV ni datos personales que
 *  el contrato actual no expone. */
export interface AdminStudentDetail {
  user: User;
  profile: StudentProfile | null;
  education: AdminStudentEducation[];
  workExperience: WorkExperience[];
}

/** Filtros del listado de alumnos. Se resuelven en el cliente sobre los datos
 *  ya traídos de la API real (`use-students.ts`) — no hay endpoint que
 *  filtre/pagine del lado del servidor; si llega a existir, probablemente
 *  viajen como query params de un GET paginado. */
export interface StudentFilters {
  search?: string;
  degreeIds?: string[];
  areaIds?: string[];
  statuses?: AccountStatus[];
  page?: number;
  perPage?: number;
}

// tipos de la pantalla de validaciones (cola de empresas y alumnos pendientes)

// fila de la tabla de empresas pendientes. es la Company real + el email y
// la fecha de registro, que en verdad viven en el User de la misma PK.
// ojo: Company no tiene contacto/persona de referencia, eso no existe en el
// modelo, no lo inventamos.
//
// la empresa puede haber completado solo el paso 1 del registro (POST /user)
// y nunca el paso 2 (POST /company) — esos campos quedan null, no se inventan.
export interface PendingCompanyRow
  extends Omit<Company, "industry" | "description" | "webUrl" | "linkedinUrl" | "location"> {
  industry: string | null;
  description: string | null;
  webUrl: string | null;
  linkedinUrl: string | null;
  location: Department | null;
  email: string;
  registeredAt: string; // ISO 8601
  hasProfile: boolean;
  /** Key de storage de la foto — mismo criterio que `StudentRow.profileImage`,
   *  ver el aviso ahí. `CompanyResponse` no tiene ningún campo de imagen: la
   *  foto de una empresa es la de su `User` (A-24), que este hook ya trae. */
  profileImage: string | null;
}

export interface PendingCompaniesFilters {
  search?: string;
  industries?: string[];
  page?: number;
  perPage?: number;
}

// mismo criterio para alumnos: StudentProfile real + email/fecha del User.
// mismo caso de perfil incompleto que PendingCompanyRow.
export interface PendingStudentRow
  extends Omit<StudentProfile, "documentType" | "documentNumber"> {
  documentType: DocumentType | null;
  documentNumber: string;
  email: string;
  registeredAt: string; // ISO 8601
  hasProfile: boolean;
  /** Key de storage de la foto — mismo criterio que `StudentRow.profileImage`,
   *  ver el aviso ahí. */
  profileImage: string | null;
}

export interface PendingStudentsFilters {
  search?: string;
  page?: number;
  perPage?: number;
}

// ---------------------------------------------------------------------------
// Listado de "Postulaciones" — vista admin, cruza todas las empresas.
// ---------------------------------------------------------------------------

/**
 * Wire: `GET /vacancy-application/detailed` — 🔒 rol ADMIN. Listado GLOBAL de
 * postulaciones YA resuelto: la respuesta trae `application` (mismo shape que
 * `VacancyApplication`, con `studentProfileId`/`accepted`) más
 * `studentName`/`studentSurname`/`studentEmail`/`vacancyId`/`vacancyName`/
 * `companyId`/`companyName` — sin necesidad de cruzar por separado
 * `StudentProfile`/`User`/`Vacancy`/`Company` como hacía la versión anterior
 * de `use-applications.ts` (fetch-all × 4 + un GET por status del enum).
 *
 * El nombre real del DTO en el backend es `ApplicationListItemResponse`; acá se
 * usa uno más explícito porque `moderacion` ya tiene varios `*Response`. Ver
 * A-30 en `docs/agents/open-questions.md`.
 *
 * ⚠️ No confundir con `VacancyApplicationDetailedResponse`
 * (`features/postulaciones/types.ts`): ese es el `/me/detailed` del ALUMNO, con
 * otro shape y sin `studentProfileId`/`accepted`.
 */
export interface AdminApplicationDetailedResponse {
  application: VacancyApplication;
  studentName: string;
  studentSurname: string;
  studentEmail: string;
  vacancyId: string;
  vacancyName: string;
  companyId: string;
  companyName: string;
}

/**
 * Fila de la tabla de postulaciones del admin: la `VacancyApplication` del
 * MER más los datos derivados que la pantalla necesita mostrar (postulante,
 * oferta, empresa). No es una entidad del MER, por eso vive acá y no en
 * `@/types`.
 *
 * A diferencia de `ApplicantRow` (`features/postulaciones/types.ts`, vista
 * empresa — ya sabe de qué empresa/puesto es porque está adentro de ese
 * contexto), esta fila necesita el nombre de la oferta y de la empresa
 * explícitos porque cruza TODAS las empresas en una sola tabla.
 *
 * Se arma directo desde `AdminApplicationDetailedResponse` (`GET
 * /vacancy-application/detailed`, ver `use-applications.ts`) — reemplaza el
 * 🔴 anterior ("sin endpoint real, hay que fetch-all × 4 y cruzar en el
 * cliente").
 */
export interface AdminApplicationRow extends VacancyApplication {
  studentName: string;
  studentSurname: string;
  studentEmail: string;
  vacancyName: string;
  companyId: string | null;
  companyName: string;
}

/** Orden de la tabla de postulaciones del admin, por fecha de postulación. */
export type AdminApplicationOrder = "recent" | "oldest";

/** Filtros del listado de postulaciones. Se resuelven en el cliente sobre los
 *  datos ya traídos de la API real (`use-applications.ts`) — sigue sin haber
 *  un endpoint que liste/filtre esto del lado del servidor, ver el aviso en
 *  `AdminApplicationRow` arriba. */
export interface AdminApplicationFilters {
  search?: string;
  vacancyIds?: string[];
  companyIds?: string[];
  statuses?: VacancyApplicationStatus[];
  order?: AdminApplicationOrder;
  page?: number;
  perPage?: number;
}

// ---------------------------------------------------------------------------
// Dashboard de Admin ("Centro de Gestión").
//
// ✅ `GET /admin/dashboard` (rol ADMIN): totales y listados de la pantalla
// inicial en una sola request. Reemplaza al enfoque anterior de traer los
// listados administrativos completos (`/company`, `/user` paginado, `/vacancy`,
// `/vacancy-application`) y calcular las métricas en el front — ese approach
// quedaba caro (N requests, un `/user` paginado completo) solo para 4 números
// y 2 listados chicos.
//
// Los tipos `*Response` de acá abajo espejan el wire tal cual — no se
// renombran campos ni se agregan los que el backend no manda (sin
// `recentActivity`: no existe una fuente de actividad general cruzada entre
// dominios, y no se inventa en el front). ⚠️ Los campos de `counts` vienen en
// ESPAÑOL (`pendientes`/`publicadas`/`alumnos`/...): es el backend rompiendo su
// propia convención de nombres en inglés, y se espeja tal cual — ver A-28.
//
// De todos esos, el único exportado es `AdminDashboardResponse`: los demás solo
// existen para componerlo y no salen de este archivo (exportarlos los deja como
// dead code en `knip`).
//
// Los view models (`DashboardStat`, `RecentVacancy`, `PendingCompanyValidation`,
// `ApplicationStatusSummary`, `RecentActivityItem`) son los que consumen los
// componentes; `use-dashboard.ts` los deriva de la respuesta del endpoint.
//
// Los estados salen de los enums core (`VacancyStatus`,
// `VacancyApplicationStatus`), no de enums propios del dashboard: un segundo
// juego de valores para lo mismo se desincroniza apenas el backend cambie uno.
//
// ⚠️ Consecuencia asumida: el dashboard solo puede graficar los estados que el
// modelo tiene hoy. No hay "Rechazada" en `VacancyStatus` (el Admin solo
// mueve PUBLICADO ↔ PENDIENTE, nunca a un estado de rechazo), y el desglose
// de postulaciones es PENDIENTE/VISTO/FINALIZADA — no aceptada/rechazada
// (`accepted` es un booleano separado, no un estado — ver el aviso en
// `VacancyApplication`, `types/index.ts`).
// ---------------------------------------------------------------------------

/** `counts.companies` de `GET /admin/dashboard`. */
interface DashboardCompanyCountsResponse {
  total: number;
  pendientes: number;
}

/** `counts.vacancies` de `GET /admin/dashboard`. */
interface DashboardVacancyCountsResponse {
  total: number;
  publicadas: number;
}

/** `counts.applications` de `GET /admin/dashboard`. */
interface DashboardApplicationCountsResponse {
  total: number;
  pendientes: number;
}

/** `counts.users` de `GET /admin/dashboard`. */
interface DashboardUserCountsResponse {
  total: number;
  alumnos: number;
  empresas: number;
  admins: number;
}

/** `counts` de `GET /admin/dashboard`. */
interface DashboardCountsResponse {
  companies: DashboardCompanyCountsResponse;
  vacancies: DashboardVacancyCountsResponse;
  applications: DashboardApplicationCountsResponse;
  users: DashboardUserCountsResponse;
}

/** Un elemento de `applicationStatusSummary` de `GET /admin/dashboard`. Sin
 *  `label`: el backend no lo manda, lo agrega el front (ver `use-dashboard.ts`). */
interface DashboardApplicationStatusSummaryResponse {
  status: VacancyApplicationStatus;
  count: number;
}

/** Un elemento de `recentVacancies` de `GET /admin/dashboard`. */
interface DashboardRecentVacancyResponse {
  vacancyId: string;
  name: string;
  companyName: string;
  /** ISO 8601 (fecha). */
  publicationDate: string;
  status: VacancyStatus;
  applicationCount: number;
}

/** Un elemento de `pendingCompanies` de `GET /admin/dashboard`. El backend ya
 *  devuelve solo las que hacen falta para la pantalla (no el listado completo
 *  de pendientes — para eso está `/moderacion/validaciones`). */
interface DashboardPendingCompanyResponse {
  companyId: string;
  name: string;
  industry: string;
  /** ISO 8601. */
  registeredAt: string;
}

/** Respuesta completa de `GET /admin/dashboard`. */
export interface AdminDashboardResponse {
  counts: DashboardCountsResponse;
  applicationStatusSummary: DashboardApplicationStatusSummaryResponse[];
  recentVacancies: DashboardRecentVacancyResponse[];
  pendingCompanies: DashboardPendingCompanyResponse[];
}

export type DashboardStatId = "companies" | "vacancies" | "applications" | "users";

/** Una de las 4 métricas calculadas de la fila superior. El ícono no es un
 *  dato: lo elige el componente a partir del `id`. */
export interface DashboardStat {
  id: DashboardStatId;
  title: string;
  value: number;
  description: string;
}

export interface RecentVacancy {
  vacancyId: string;
  name: string;
  companyName: string;
  /** ISO 8601 (fecha) — el formato lo decide la vista. */
  publicationDate: string;
  applicationCount: number;
  status: VacancyStatus;
}

export interface PendingCompanyValidation {
  companyId: string;
  name: string;
  industry: string;
  /** ISO 8601. */
  registeredAt: string;
}

export type ActivityType = "company" | "vacancy" | "application" | "user" | "validation";

export interface RecentActivityItem {
  id: string;
  title: string;
  description: string;
  /** ISO 8601 (datetime); la vista resuelve cómo presentarlo. */
  occurredAt: string;
  href: string;
  type: ActivityType;
}

/** Sin `percentage`: se deriva del total en el componente. Guardarlo permitía
 *  que contradijera al `count`, y de hecho lo hacía — los tres sumaban 79% y
 *  el donut quedaba con una cuña vacía del 21%. */
export interface ApplicationStatusSummary {
  status: VacancyApplicationStatus;
  label: string;
  count: number;
}

// ---------------------------------------------------------------------------
// Vista de empresas — Admin
// ---------------------------------------------------------------------------

/**
 * View model del listado administrativo de empresas.
 *
 * Combina Company con los datos de User necesarios para la vista.
 * El estado de aprobación pertenece a `User.status`, pero `CompanyResponse`
 * (`GET /company`) también lo duplica directo (A-18) — no hace falta un
 * segundo fetch a `/user` solo para el status.
 */
export interface AdminCompanyRow {
  id: string;
  name: string;
  email: string;
  industry: string;
  location: string;
  /** Puede faltar solo si no se logra resolver el User con la misma PK. */
  registeredAt: string | null;
  status: AccountStatus;
  initials: string;
  /**
   * Key de storage de la foto, NO una URL — se canjea con
   * `useSignedProfileImageUrl`. `null` si nunca subió una (o si no se resolvió
   * el `User` de la misma PK).
   *
   * ⚠️ Sale del `User`, no de `Company`: `CompanyResponse` no tiene ningún campo
   * de imagen (A-24, `docs/agents/open-questions.md`). Va en la fila a propósito
   * porque el hook ya lee ese `User` para el email — si la tabla usara
   * `useProfileImage(id)`, cada fila dispararía un `GET /user/{id}` extra solo
   * para releer este mismo campo, que es justo el N+1 que A-24 evita.
   */
  profileImage: string | null;
}

/**
 * View model del detalle administrativo de una empresa.
 *
 * Los campos adicionales pertenecen a `Company`; no se agrega cantidad de
 * empleados porque ese dato no existe en el contrato actual del backend.
 */
export interface AdminCompanyDetail extends AdminCompanyRow {
  description: string;
  webUrl: string;
  linkedinUrl: string;
  /** `CompanyResponse` los expone directo (A-18). El detalle los muestra si
   *  están presentes — ver la card "Información adicional". */
  reviewedAt: string | null;
  adminComment: string | null;
}

/**
 * Estado de búsqueda, filtros y paginación de la vista de empresas.
 *
 * Los filtros son arrays y no un valor único con centinela `"TODAS"`: la barra
 * de filtros del repo usa `MultiSelect` (`docs/agents/design-system.md`, "Barras de filtros"), y
 * "sin filtro" se representa con el array vacío, no con un valor mágico.
 */
export interface AdminCompanyFilters {
  search?: string;
  statuses?: AccountStatus[];
  industries?: string[];
  locations?: string[];
  page?: number;
  perPage?: number;
}

// ---------------------------------------------------------------------------
// Vista de ofertas — Admin
// ---------------------------------------------------------------------------

/**
 * Fila del listado administrativo de ofertas.
 *
 * Conserva todos los campos de `Vacancy` y agrega únicamente datos derivados
 * que necesita la tabla para mostrar la empresa y el total de postulaciones.
 */
export interface AdminVacancyRow extends Vacancy {
  companyName: string;
  companyInitials: string;
  applicationCount: number;
}

/** Detalle administrativo de una oferta. Es el superset de la fila: además
 *  resuelve las relaciones reales que el Admin necesita consultar sin
 *  introducir los campos exploratorios del preview del feed. */
export interface AdminVacancyDetail extends AdminVacancyRow {
  company: Company | null;
  companyUser: User | null;
  area: Area | null;
  parentArea: Area | null;
  applicationStatusCounts: Record<VacancyApplicationStatus, number>;
  selectedApplicationCount: number;
}

/** Filtros del listado de ofertas. El backend solo admite un estado y una
 * modalidad por request; para conservar los multiselects se aplican en el
 * cliente sobre `GET /vacancy`. */
export interface AdminVacancyFilters {
  search?: string;
  companyIds?: string[];
  statuses?: VacancyStatus[];
  modalities?: Modality[];
  page?: number;
  perPage?: number;
}
