// Tipos del dominio: moderacion (Admin UCU).
//
// Las entidades core viven en @/types. Acá van las acciones de moderación.
//
// Estado de los endpoints de moderación (docs/ENDPOINTS.md):
//   - Cola de CUENTAS (empresas/alumnos): ✅ `PATCH /user/{id}` con
//     { status, adminComment } EXISTE (A-02, Resuelto). `AccountResolution` se
//     puede enchufar; la pantalla de validaciones ya lo usa (hoy como andamio
//     sobre fixtures — ver use-review-account.ts, con el swap a apiClient
//     marcado como TODO).
//   - Cola de VACANTES: ✅ `PUT /vacancy/status/{id}` (rol ADMIN,
//     `UpdateVacancyStatusAdminRequest`) EXISTE — el Admin mueve
//     `PUBLICADO ↔ PENDIENTE`, nunca a `FINALIZADO` (eso es exclusivo de la
//     empresa dueña vía `PATCH /vacancy/status/{id}`). Ver `ReviewVacancyInput`
//     en `use-review-vacancy.ts`, ya enchufado sobre fixtures con ese criterio
//     (no hay un `VacancyResolution` acá: `VacancyStatus` no tiene `RECHAZADO`,
//     así que no hace falta un tipo de "decisión" aparte — el input es
//     directamente el `VacancyStatus` destino).

import type {
  AccountStatus,
  Area,
  Company,
  Degree,
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
export interface StudentRow extends StudentProfile {
  email: string;
  status: AccountStatus;
  registeredAt: string; // ISO 8601
  degreeId: string | null;
  degreeName: string;
  areaId: string | null;
  areaName: string;
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
  profile: StudentProfile;
  education: AdminStudentEducation[];
  workExperience: WorkExperience[];
}

/** Filtros del listado de alumnos. Se resuelven en el cliente sobre
 *  fixtures hoy (no hay endpoint — ver aviso arriba); si llega a existir,
 *  probablemente viajen como query params de un GET paginado. */
export interface StudentFilters {
  search?: string;
  degreeIds?: string[];
  areaIds?: string[];
  page?: number;
  perPage?: number;
}

// tipos de la pantalla de validaciones (cola de empresas y alumnos pendientes)

// fila de la tabla de empresas pendientes. es la Company real + el email y
// la fecha de registro, que en verdad viven en el User de la misma PK.
// ojo: Company no tiene contacto/persona de referencia, eso no existe en el
// modelo, no lo inventamos
export interface PendingCompanyRow extends Company {
  email: string;
  registeredAt: string; // ISO 8601
}

export interface PendingCompaniesFilters {
  search?: string;
  industries?: string[];
  page?: number;
  perPage?: number;
}

// mismo criterio para alumnos: StudentProfile real + email/fecha del User
export interface PendingStudentRow extends StudentProfile {
  email: string;
  registeredAt: string; // ISO 8601
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
 * 🔴 Sin endpoint real: `docs/ENDPOINTS.md` no tiene un listado global de
 * postulaciones para ADMIN (solo `?studentProfileId=` por alumno puntual, y
 * `/status-summary` para totales) — ver el aviso en `use-applications.ts`.
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

/** Filtros del listado de postulaciones. Se resuelven en el cliente sobre
 *  fixtures hoy (no hay endpoint — ver aviso arriba). */
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
// Son view models de una sola pantalla, no entidades del MER — por eso viven
// acá y no en `@/types`.
//
// 🔴 Cobertura parcial: `docs/ENDPOINTS.md` sí tiene endpoints de conteo por
// dominio (`GET /student-profile/status-summary`, `/company/status-summary`,
// `/vacancy/status-summary`, `/vacancy-application/status-summary` — útiles
// para `ApplicationStatusSummary` y los totales de `DashboardStat`), pero no
// hay nada para `weeklyChange` (delta semanal) ni para `RecentActivityItem`
// (un feed de actividad reciente cruzando dominios) — esos dos siguen sin
// endpoint. Hoy los datos salen enteros de
// `features/moderacion/data/dashboard-mock.ts` a través de
// `hooks/use-dashboard.ts`; conectar los status-summary es la parte que ya
// se puede hacer.
//
// Los estados salen de los enums core (`VacancyStatus`,
// `VacancyApplicationStatus`), no de enums propios del dashboard: un segundo
// juego de valores para lo mismo se desincroniza apenas el backend cambie uno.
//
// ⚠️ Consecuencia asumida: el dashboard solo puede graficar los estados que el
// modelo tiene hoy. No hay "Rechazada" en `VacancyStatus` (el Admin solo
// mueve PUBLICADO ↔ PENDIENTE, nunca a un estado de rechazo), y el desglose
// de postulaciones es PENDIENTE/VISTO/FINALIZADA — no aceptada/rechazada
// (DEC-06 la descartó a favor de `selected`, que a su vez se eliminó del
// contrato cerrado — ver el aviso en `VacancyApplication`, `types/index.ts`).
// No hay ningún eje de "resultado" para graficar hoy, ni como estado ni como
// campo aparte.
// ---------------------------------------------------------------------------

/** Una de las 4 métricas de la fila superior. El ícono no es un dato: lo elige
 *  el componente a partir del `id`. */
export interface DashboardStat {
  id: string;
  title: string;
  value: string;
  weeklyChange: string;
}

export interface RecentVacancy {
  id: string;
  position: string;
  company: string;
  /** ISO 8601 — el formato de fecha lo decide la vista, no el dato. */
  publishedAt: string;
  applications: number | null;
  status: VacancyStatus;
}

export interface PendingCompanyValidation {
  id: string;
  name: string;
  description: string;
  /** ISO 8601. */
  registeredAt: string;
}

export type ActivityType = "company" | "vacancy" | "application" | "user" | "validation";

export interface RecentActivityItem {
  id: string;
  title: string;
  description: string;
  /** Texto relativo ya resuelto ("Hace 2 horas"). */
  time: string;
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
  registeredAt: string;
  status: AccountStatus;
  initials: string;
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
}

/**
 * Estado de búsqueda, filtros y paginación de la vista de empresas.
 *
 * Los filtros son arrays y no un valor único con centinela `"TODAS"`: la barra
 * de filtros del repo usa `MultiSelect` (AGENTS.md, "Barras de filtros"), y
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

/** Filtros del listado de ofertas. Se resuelven sobre fixtures mientras se
 * integra el contrato administrativo vigente. */
export interface AdminVacancyFilters {
  search?: string;
  companyIds?: string[];
  statuses?: VacancyStatus[];
  modalities?: Modality[];
  page?: number;
  perPage?: number;
}
