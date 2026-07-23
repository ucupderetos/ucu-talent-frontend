// Tipos del dominio: moderacion (Admin UCU).
//
// Las entidades core viven en @/types. Acá van las acciones de moderación.
//
// 🔴 BLOQUEANTE CONFIRMADO leyendo `docs/ENDPOINTS.md` del backend (rama
// `dev`): NINGUNA de las dos colas de este dominio tiene un endpoint real
// todavía. No es una asunción — es la lectura literal del documento:
//   - Sección 1 (`/user`) no tiene `PUT`: no hay forma de pasar una cuenta de
//     `PENDIENTE` a `APROBADO`/`RECHAZADO` (`AccountStatus`, ver types/index.ts).
//   - Sección 10 (`/vacancy`): el único `PUT /vacancy/{id}` es rol `EMPRESA`,
//     no `ADMIN` — y el enum `VacancyStatus` ni siquiera tiene un valor
//     "publicado" o "rechazado" hoy (solo `PENDIENTE`/`FINALIZADO`).
// Los tipos de abajo quedan como CONTRATO DESEADO (lo que RF-12/RF-13 piden),
// no como algo que ya se pueda enchufar a un endpoint real. Antes de escribir
// hooks para `(admin)/moderacion`, confirmar con el equipo de backend si estas
// acciones están en el roadmap y con qué forma van a salir — construir contra
// esta interfaz hoy sería construir contra un endpoint que no existe.

import type { AccountStatus, Company, StudentProfile } from "@/types";

/**
 * RF-13: aprobar o rechazar una empresa (o un alumno — `AccountStatus` es
 * genérico a los 3 roles, no solo a empresa). El campo cambió de forma: antes
 * era un booleano en `Company.approved` que no podía distinguir "rechazada"
 * de "todavía no revisada"; ahora `AccountStatus` en `User.status` sí lo
 * distingue. Buena noticia: la deuda del booleano quedó resuelta por el MER.
 * Mala noticia: no hay endpoint que la use (ver aviso arriba).
 */
export interface AccountResolution {
  userId: string;
  status: Extract<AccountStatus, "APROBADO" | "RECHAZADO">;
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
