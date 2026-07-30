// Tipos del dominio: auth.
//
// `User`, `Role`, `DocumentType`, `Department` viven en @/types. Acá va lo
// específico: credenciales y los payloads de las 3 llamadas encadenadas del
// registro (ver `docs/agents/roles-and-access-control.md`, "Registro en dos pasos y ProfileGuard"):
//   1. POST /user            → 201, no loguea
//   2. POST /auth/login      → 200 + Set-Cookie httpOnly — obligatorio, no opcional
//   3. POST /student-profile → 201 (o POST /company, según el rol)
//
// El paso 3 pide los campos mínimos `@NotBlank` de `docs/ENDPOINTS.md`, ni uno
// más — el resto (teléfono, LinkedIn, skills, descripción, foto) se completa
// después desde /perfil. Si el paso 3 falla (se cierra la pestaña, error de
// red), la cuenta queda logueada pero sin perfil — `ProfileGuard`
// (`features/perfil/components/`) es la red que atrapa ese caso.

// Los inputs del paso 3 (`StudentProfileRegistrationInput` /
// `CompanyRegistrationInput`) NO viven acá: los comparte `perfil`
// (`use-complete-profile.ts`) además de `auth`, así que subieron a `@/types`.

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
