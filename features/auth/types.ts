// Tipos del dominio: auth.
//
// `User` y `Rol` viven en @/types. Acá va lo específico: credenciales y
// payloads de registro.
//
// ⚠️ PROVISORIO: el contrato de la API todavía no está definido. En particular,
// falta confirmar si el JWT viaja en cookie httpOnly (asunción actual) — de eso
// depende que el login no devuelva token al cliente.

export interface Credenciales {
  email: string;
  password: string;
}

/**
 * RF-01: el alumno se valida contra padrón de cédulas o mail @ucu.
 * Cuál de los dos exige el backend está sin confirmar.
 */
export interface RegistroAlumno {
  nombre: string;
  email: string;
  password: string;
  cedula?: string;
}

/** RF-13: la empresa se registra y queda `pendiente` hasta que Admin UCU la apruebe. */
export interface RegistroEmpresa {
  nombreEmpresa: string;
  nombreContacto: string;
  email: string;
  password: string;
}
