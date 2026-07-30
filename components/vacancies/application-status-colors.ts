// Mapa de color único para `VacancyApplicationStatus`, usado por el único
// `ApplicationStatusBadge` compartido (components/vacancies/application-status-badge.tsx),
// consumido por las 3 vistas (alumno, empresa, admin).
//
// Antes cada vista tenía su propio componente con su propio mapa de color Y
// de label, y quedaban incoherentes entre sí (PENDIENTE era `warning` en uno,
// `success` en otro y `chart-2` en el tercero) — incluso contradiciendo el
// semáforo que ya usa `vacancy-status-badge.tsx` (warning = necesita
// atención, muted = estado terminal). Se unificó primero el color acá, y
// después el label también (decisión de producto: los tres roles muestran
// el mismo texto para el mismo estado) — ver `application-status-badge.tsx`.

import type { VacancyApplicationStatus } from "@/types";

export const APPLICATION_STATUS_DOT_CLASS: Record<VacancyApplicationStatus, string> = {
  PENDIENTE: "bg-warning",
  VISTO: "bg-chart-2",
  FINALIZADO: "bg-muted-foreground",
};
