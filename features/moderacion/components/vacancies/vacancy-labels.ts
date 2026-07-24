import type { Modality } from "@/types";

/** Diccionario de presentación: los valores que llegan del backend no se
 * traducen ni se alteran en los tipos core.
 *
 * El de `VacancyStatus` NO está acá: vive en
 * `components/vacancies/vacancy-status-badge.tsx` porque lo comparten los tres
 * roles. Tener uno propio por dominio fue lo que hizo que la misma vacante se
 * leyera "Activa" para la empresa y "Pendiente" para el Admin. */
export const VACANCY_MODALITY_LABEL: Record<Modality, string> = {
  PRESENCIAL: "Presencial",
  HIBRIDO: "Híbrida",
  REMOTO: "Remota",
};
