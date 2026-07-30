// Mapa de color único para `VacancyApplicationStatus`, compartido por los tres
// badges que lo pintan (postulaciones/application-status-badge.tsx —vista
// alumno—, postulaciones/applicant-status-badge.tsx —vista empresa— y
// moderacion/applications/application-status-badge.tsx —vista admin—).
//
// Antes cada uno tenía su propio mapa y quedaban incoherentes entre sí
// (PENDIENTE era `warning` en uno, `success` en otro y `chart-2` en el
// tercero) — incluso contradiciendo el semáforo que ya usa
// `vacancy-status-badge.tsx` (warning = necesita atención, muted = estado
// terminal). Este archivo es la única fuente de esos colores; el LABEL de
// cada estado sigue siendo propio de cada badge a propósito (ver AGENTS.md /
// checklist de auditoría: si los tres roles deberían llamar igual al mismo
// estado es una decisión de producto todavía sin definir, no algo que este
// cambio deba forzar).

import type { VacancyApplicationStatus } from "@/types";

export const APPLICATION_STATUS_DOT_CLASS: Record<VacancyApplicationStatus, string> = {
  PENDIENTE: "bg-warning",
  VISTO: "bg-chart-2",
  FINALIZADO: "bg-muted-foreground",
};
