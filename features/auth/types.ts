// Tipos del dominio: auth.
//
// `User`, `Role`, `DocumentType`, `Department` viven en @/types. Acá va lo
// específico: credenciales y los payloads de las 3 llamadas encadenadas del
// registro (ver AGENTS.md, "Registro en dos pasos y ProfileGuard"):
//   1. POST /user            → 201, no loguea
//   2. POST /auth/login      → 200 + Set-Cookie httpOnly — obligatorio, no opcional
//   3. POST /student-profile → 201 (o POST /company, según el rol)
//
// El paso 3 pide los campos mínimos `@NotBlank` de `docs/ENDPOINTS.md`, ni uno
// más — el resto (teléfono, LinkedIn, skills, descripción, foto) se completa
// después desde /perfil. Si el paso 3 falla (se cierra la pestaña, error de
// red), la cuenta queda logueada pero sin perfil — `ProfileGuard`
// (`features/perfil/components/`) es la red que atrapa ese caso.

import type { Department, DocumentType } from "@/types";

export interface Credentials {
  email: string;
  password: string;
}

/** `POST /user` — paso 1. Registro público solo admite
 *  `ALUMNO` | `EMPRESA`. */
export interface Registration {
  email: string;
  password: string;
  role: "ALUMNO" | "EMPRESA";
}

/**
 * `POST /student-profile` — paso 3 si el rol es `ALUMNO`. `phoneNumber`,
 * `linkedinUrl` y `skills` son opcionales en el backend: no bloquean el alta,
 * se completan después desde `/perfil`.
 */
export interface StudentProfileRegistrationInput {
  name: string;
  surname: string;
  documentType: DocumentType;
  documentNumber: string;
  phoneNumber?: string;
  linkedinUrl?: string;
  skills?: string[];
}

/**
 * `POST /company` — paso 3 si el rol es `EMPRESA`. Todos los campos son
 * `@NotBlank` en el backend: no hay forma de diferir ninguno.
 */
export interface CompanyRegistrationInput {
  name: string;
  industry: string;
  description: string;
  webUrl: string;
  linkedinUrl: string;
  location: Department;
}
