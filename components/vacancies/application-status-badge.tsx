// Badge único para `VacancyApplicationStatus`, compartido por las 3 vistas
// (alumno, empresa, admin). Antes cada una tenía su propio componente con
// color Y label distintos — el color ya se había unificado en
// application-status-colors.ts, dejando el label "propio de cada vista a
// propósito". Esa distinción se cerró por decisión de producto: los tres
// roles muestran el mismo texto (traducción literal del enum wire).

import { Badge } from "@/components/ui/badge";
import { APPLICATION_STATUS_DOT_CLASS } from "@/components/vacancies/application-status-colors";
import { cn } from "@/lib/utils";
import type { VacancyApplicationStatus } from "@/types";

export const APPLICATION_STATUS_LABEL: Record<VacancyApplicationStatus, string> = {
  PENDIENTE: "Pendiente",
  VISTO: "Visto",
  FINALIZADO: "Finalizado",
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
