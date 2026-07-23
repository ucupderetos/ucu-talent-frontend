// Traducción visual de `VacancyApplicationStatus` para "Mis postulaciones"
// (vista alumno). Un solo lugar para no repetir el mapeo en card, filtros, etc.
// Mismo criterio de color-por-punto que VacancyStatusBadge
// (features/puestos/components/vacancy-status-badge.tsx).

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { VacancyApplicationStatus } from "@/types";

export const APPLICATION_STATUS_LABEL: Record<VacancyApplicationStatus, string> = {
  PENDIENTE: "Pendiente",
  VISTO: "Vista",
  FINALIZADO: "Finalizada",
};

const APPLICATION_STATUS_DOT_CLASS: Record<VacancyApplicationStatus, string> = {
  PENDIENTE: "bg-amber-500",
  VISTO: "bg-blue-500",
  FINALIZADO: "bg-muted-foreground",
};

export function ApplicationStatusBadge({ status }: { status: VacancyApplicationStatus }) {
  return (
    <Badge variant="outline" className="gap-1.5">
      <span
        className={cn("size-1.5 shrink-0 rounded-full", APPLICATION_STATUS_DOT_CLASS[status])}
        aria-hidden
      />
      {APPLICATION_STATUS_LABEL[status]}
    </Badge>
  );
}
