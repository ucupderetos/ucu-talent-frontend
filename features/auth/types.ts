// Tipos del dominio: auth.
//
// `User`, `Role`, `DocumentType`, `Department` viven en @/types. Acá va lo
// específico: credenciales y el payload de alta de cuenta.
//
// El registro es un solo paso — `POST /user` (email, password, role) + login
// explícito. El perfil (`StudentProfile`/`Company`) NO se pide en el
// registro: se completa después desde "editar perfil" (`features/perfil/`,
// todavía sin construir) — decisión de equipo.

import type { Department, DocumentType } from "@/types";

export interface Credentials {
  email: string;
  password: string;
}

/** `POST /user` — alta de cuenta. Registro público solo admite
 *  `ALUMNO` | `EMPRESA`. */
export interface Registration {
  email: string;
  password: string;
  role: "ALUMNO" | "EMPRESA";
}

/**
 * `POST /student-profile` — completar perfil de alumno. `phoneNumber`,
 * `linkedinUrl` y `skills` son opcionales en el backend: no bloquean el alta.
 * ⚠️ Sin consumidor todavía — lo va a usar `features/perfil/` cuando se
 * construya esa pantalla, no el registro.
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
 * `POST /company` — completar perfil de empresa. Todos los campos son
 * `@NotBlank` en el backend: no hay forma de diferir ninguno una vez que se
 * complete el perfil. ⚠️ Sin consumidor todavía — lo va a usar
 * `features/perfil/` cuando se construya esa pantalla, no el registro.
 */
export interface CompanyRegistrationInput {
  name: string;
  industry: string;
  description: string;
  webUrl: string;
  linkedinUrl: string;
  location: Department;
}
