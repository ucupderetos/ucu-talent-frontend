// Tipos del dominio: moderacion (Admin UCU).
//
// `Puesto` y `Empresa` viven en @/types. Acá va lo específico: las acciones de
// moderación y sus filtros.
//
// ⚠️ PROVISORIO: el contrato de la API todavía no está definido.

/** RF-13: el gate de aprobación es sobre la EMPRESA, no sobre cada puesto. */
export interface ResolucionEmpresa {
  empresaId: string;
  decision: "aprobar" | "rechazar";
  motivo?: string;
}

/**
 * RF-12: Admin UCU despublica un puesto YA publicado — no aprueba antes de que
 * salga. El puesto se publica por default al crearse.
 */
export interface DespublicarPuesto {
  puestoId: string;
  motivo: string;
}

export type ColaModeracion = "empresas-pendientes" | "puestos-publicados";
