// Diccionario de presentación de `Education.DegreeLevel`. Mismo patrón que
// lib/contract-types.ts / lib/modality.ts. Antes estaba triplicado
// (perfil/education-tab, postulaciones/applicant-detail-view,
// moderacion/student-detail-view).

import type { DegreeLevel } from "@/types";

export const DEGREE_LEVEL_LABELS: Record<DegreeLevel, string> = {
  TECNICATURA: "Tecnicatura",
  LICENCIATURA: "Licenciatura",
  GRADO: "Grado",
  POSGRADO: "Posgrado",
  DOCTORADO: "Doctorado",
};
