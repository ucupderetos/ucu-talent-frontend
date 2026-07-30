// Traducción visual de `VacancyApplicationStatus` para "Mis postulaciones"
// (vista alumno). Un solo lugar para no repetir el mapeo en card, filtros, etc.
// El color del punto sale de application-status-colors.ts (compartido con los
// otros dos badges de este mismo estado) — el LABEL sigue siendo propio de
// esta vista.

import { Badge } from "@/components/ui/badge";
import { APPLICATION_STATUS_DOT_CLASS } from "@/components/vacancies/application-status-colors";
import { cn } from "@/lib/utils";
import type { VacancyApplicationStatus } from "@/types";

export const APPLICATION_STATUS_LABEL: Record<VacancyApplicationStatus, string> = {
  PENDIENTE: "Pendiente",
  VISTO: "Vista",
  FINALIZADO: "Finalizada",
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
