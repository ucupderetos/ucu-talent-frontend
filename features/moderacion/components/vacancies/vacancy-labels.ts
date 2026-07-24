import type { Modality, VacancyStatus } from "@/types";

/** Diccionarios de presentación: los valores que llegan del backend no se
 * traducen ni se alteran en los tipos core. */
export const VACANCY_STATUS_LABEL: Record<VacancyStatus, string> = {
  PENDIENTE: "Pendiente",
  FINALIZADO: "Finalizada",
};

export const VACANCY_MODALITY_LABEL: Record<Modality, string> = {
  PRESENCIAL: "Presencial",
  HIBRIDO: "Híbrida",
  REMOTO: "Remota",
};
