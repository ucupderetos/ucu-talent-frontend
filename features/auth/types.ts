// Tipos del dominio: auth.
//
// `User` y `Role` viven en @/types. Acá va lo específico: credenciales y
// payloads de registro.
//
// ⚠️ PROVISORIO: el contrato de la API todavía no está definido. En particular,
// falta confirmar si el JWT viaja en cookie httpOnly (asunción actual) — de eso
// depende que el login no devuelva token al cliente.

export interface Credentials {
  email: string;
  password: string;
}

/**
 * RF-01: el alumno se valida contra padrón de cédulas o mail @ucu.
 *
 * ⚠️ Simplificado a propósito: solo cédula + mail + contraseña. El resto del
 * perfil (nombre, apellido, teléfono) se completa después, no en el alta.
 * `documentType` queda fijo en cédula uruguaya — si el backend termina
 * aceptando otros documentos, se agrega un selector acá.
 */
export interface StudentRegistration {
  email: string;
  password: string;
  documentNumber: string;
}

/**
 * RF-13: la empresa se registra y queda con `approved: false` hasta que Admin UCU
 * la apruebe.
 *
 * ⚠️ `Company` no tiene campo de nombre propio en el MER: el nombre de la empresa
 * va en `User.name`. TODO: confirmar.
 */
export interface CompanyRegistration {
  /** Va a `User.name` — el MER no tiene `Company.name`. */
  companyName: string;
  email: string;
  password: string;
  phoneNumber: string;
  industry: string;
  description: string;
  webUrl: string;
  linkedinUrl: string;
}
