// Tipos del dominio: moderacion (Admin UCU).
//
// Las entidades core viven en @/types. Acá van las acciones de moderación.
//
// Estado de los endpoints de moderación (AGENTS.md, "Pendiente de aclarar"):
//   - Cola de CUENTAS (empresas/alumnos): ✅ `PATCH /user/{id}` con
//     { status, adminComment } EXISTE (A-02, Resuelto). `AccountResolution` se
//     puede enchufar; la pantalla de validaciones ya lo usa (hoy como andamio
//     sobre fixtures — ver use-review-account.ts, con el swap a apiClient
//     marcado como TODO).
//   - Cola de VACANTES: 🔴 todavía sin endpoint de ADMIN. El único
//     `PUT /vacancy/{id}` es rol `EMPRESA`, y `VacancyStatus` no tiene
//     "publicado"/"rechazado" hoy (solo `PENDIENTE`/`FINALIZADO`).
//     `VacancyResolution` queda como CONTRATO DESEADO (RF-12), NO enchufable
//     aún — confirmar con backend antes de construir hooks contra él.

import type {
  AccountStatus,
  Company,
  StudentProfile,
  VacancyApplication,
  VacancyApplicationStatus,
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

/**
 * RF-12: resolver una vacante en `PENDIENTE`.
 *
 * `decision: "reject"` no tiene dónde aterrizar hoy: `VacancyStatus` no tiene
 * `RECHAZADO` (ver el gap en `types/index.ts` y en
 * `features/puestos/types.ts`). Queda modelado igual porque es lo que pide
 * RF-12, pero USARLO hoy rompe: no hay valor de `VacancyStatus` ni endpoint
 * de `ADMIN` para esto.
 */
export interface VacancyResolution {
  vacancyId: string;
  decision: "approve" | "reject";
  /** El MER no tiene campo para motivo de rechazo en `Vacancy` — si hace
   *  falta, hay que pedirlo al backend. */
  reason?: string;
}

/** Las dos colas del panel de Admin UCU. */
export type ModerationQueue = "pending-accounts" | "pending-vacancies";

// ---------------------------------------------------------------------------
// Listado de "Usuarios" (alumnos) — RF-MOD-05 desde el lado del Admin.
// ---------------------------------------------------------------------------

/**
 * Fila de la tabla de alumnos: el `StudentProfile` del MER más los datos
 * derivados que la pantalla necesita mostrar (email/fecha de registro vienen
 * del `User` con la misma PK, carrera/facultad de `Education` → `Degree` →
 * `Area`). No es una entidad del MER, por eso vive acá y no en `@/types`.
 */
export interface StudentRow extends StudentProfile {
  email: string;
  registeredAt: string; // ISO 8601
  degreeId: string | null;
  degreeName: string;
  areaId: string | null;
  areaName: string;
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
 * A diferencia de `ApplicantListItem` (`features/postulaciones/types.ts`,
 * vista empresa — ya sabe de qué empresa/puesto es porque está adentro de
 * ese contexto), esta fila necesita el nombre de la oferta y de la empresa
 * explícitos porque cruza TODAS las empresas en una sola tabla.
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
