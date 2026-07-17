// Tipos del dominio: postulaciones.
//
// Las entidades `Postulacion` y `PerfilAlumno` viven en @/types (las comparten
// alumno y empresa). Acá va lo específico: view models de la gestión de
// postulantes y las plantillas de mail del RF-21.
//
// ⚠️ PROVISORIO: el contrato de la API todavía no está definido.

import type { EstadoPostulacion, PerfilAlumno, Postulacion, Puesto } from "@/types";

/** Fila de la lista de postulantes que ve la empresa: la postulación + quién es. */
export interface PostulanteEnLista {
  postulacion: Postulacion;
  alumno: PerfilAlumno;
}

/** Fila de "mis postulaciones" que ve el alumno: la postulación + a qué puesto. */
export interface MiPostulacion {
  postulacion: Postulacion;
  puesto: Puesto;
}

export interface CambioEstadoPostulacion {
  estado: EstadoPostulacion;
}

/**
 * RF-21: la empresa contacta al postulante con una plantilla predefinida,
 * disparada como link `mailto:` — NO es envío automático desde el backend.
 *
 * ⚠️ El tipo de plantilla no se puede derivar de `EstadoPostulacion`: el enum
 * (pendiente/visto/finalizado) no distingue si el finalizado fue avance o
 * rechazo. Pendiente de confirmar con el equipo — ver comentario en @/types.
 */
export type TipoPlantillaMail = "avanza" | "rechazado";

export interface PlantillaMail {
  tipo: TipoPlantillaMail;
  asunto: string;
  cuerpo: string;
}
