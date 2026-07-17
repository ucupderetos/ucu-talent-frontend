// Tipos globales compartidos por toda la app.
//
// Acá viven las ENTIDADES CORE del modelo de datos: las que cruzan más de un
// dominio. Ej: `Puesto` lo usan puestos (CRUD), moderacion (RF-12) y
// postulaciones (una postulación es a un puesto). Como la regla del equipo es
// "no importar desde features/ de otro dominio", esas entidades suben acá.
//
// Lo específico de un dominio (filtros, inputs de formulario, view models) va
// en features/<x>/types.ts, no acá.
//
// ⚠️ PROVISORIO: el contrato de la API todavía no está definido. Los nombres de
// campo van a tener que ajustarse cuando el backend lo publique.

// ---------------------------------------------------------------------------
// Usuario y roles
// ---------------------------------------------------------------------------

export type Rol = "alumno" | "empresa" | "admin";

export interface User {
  id: string;
  nombre: string;
  email: string;
  rol: Rol;
}

// ---------------------------------------------------------------------------
// Empresa
// ---------------------------------------------------------------------------

/**
 * RF-13: la empresa necesita aprobación de Admin UCU antes de poder operar.
 * El gate es sobre la EMPRESA, no sobre cada puesto.
 */
export type EstadoEmpresa = "pendiente" | "aprobada" | "rechazada";

export interface Empresa {
  id: string;
  nombre: string;
  estado: EstadoEmpresa;
}

// ---------------------------------------------------------------------------
// Puestos
// ---------------------------------------------------------------------------

/**
 * El puesto se publica por default al crearse — no existe "pendiente de
 * aprobación". Admin UCU puede despublicar uno ya publicado (RF-12).
 */
export type EstadoPuesto = "publicado" | "pausado" | "finalizado" | "eliminado";

export interface Puesto {
  id: string;
  titulo: string;
  descripcion: string;
  estado: EstadoPuesto;
  empresaId: string;
  empresaNombre: string;
  publicadoEn: string; // ISO 8601
}

// ---------------------------------------------------------------------------
// Postulaciones
// ---------------------------------------------------------------------------

/**
 * Estado de una postulación, visto desde la empresa.
 *
 * ⚠️ Confirmado por el equipo, pero OJO: no distingue "finalizado con avance"
 * de "finalizado con rechazo", y el RF-21 manda plantillas de mail distintas
 * según ese resultado. Si se confirma que hacen falta, va un campo aparte
 * (ej. `resultado`) — no agregar valores a este enum sin hablarlo.
 */
export type EstadoPostulacion = "pendiente" | "visto" | "finalizado";

export interface Postulacion {
  id: string;
  puestoId: string;
  alumnoId: string;
  estado: EstadoPostulacion;
  postuladoEn: string; // ISO 8601
}

// ---------------------------------------------------------------------------
// Perfil del alumno
// ---------------------------------------------------------------------------

/**
 * La empresa ve el perfil de sus postulantes, así que esto cruza los dominios
 * `perfil` y `postulaciones`.
 */
export interface PerfilAlumno {
  id: string;
  nombre: string;
  email: string;
  carrera: string;
  skills: string[];
}

// ---------------------------------------------------------------------------
// Utilidades de API
// ---------------------------------------------------------------------------

/** Respuesta paginada. La forma real depende del contrato del backend. */
export interface Paginado<T> {
  items: T[];
  total: number;
  pagina: number;
  porPagina: number;
}
