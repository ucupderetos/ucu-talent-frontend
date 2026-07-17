// Tipos del dominio: puestos.
//
// La entidad `Puesto` vive en @/types (la comparten moderacion y postulaciones).
// Acá va solo lo específico de este dominio: filtros, orden e inputs de form.
//
// ⚠️ PROVISORIO: el contrato de la API todavía no está definido.

import type { EstadoPuesto } from "@/types";

/**
 * Orden del feed.
 *
 * ⚠️ "coincidencia" (RF-14) está PENDIENTE DE ACLARAR: no está confirmado si es
 * un ordenamiento simple por reglas (carrera/skills en común) o si se lee como
 * motor de matching — lo cual chocaría con "fuera de alcance: recomendación con
 * IA/ML". No construir sobre esto sin confirmarlo con el equipo/docente.
 */
export type OrdenFeed = "recientes" | "coincidencia";

/** Filtros del feed de puestos (RF-14). */
export interface FiltrosPuestos {
  busqueda?: string;
  carrera?: string;
  skills?: string[];
  orden?: OrdenFeed;
}

/** Payload para crear o editar un puesto. La empresa no elige el estado al crear:
 *  se publica por default. */
export interface PuestoInput {
  titulo: string;
  descripcion: string;
}

/** Cambio de estado de un puesto hecho por la empresa dueña. */
export interface CambioEstadoPuesto {
  estado: Extract<EstadoPuesto, "pausado" | "publicado" | "finalizado">;
}
