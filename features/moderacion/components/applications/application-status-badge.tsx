// Traducción visual de `VacancyApplicationStatus` (RN-08 del SRS: el estado
// solo avanza PENDIENTE → VISTO → FINALIZADA, nunca retrocede). Un solo lugar
// para no repetir el mapeo en tabla y filtros — mismo patrón que
// `features/puestos/components/vacancy-status-badge.tsx`.

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { VacancyApplicationStatus } from "@/types";

export const APPLICATION_STATUS_LABEL: Record<VacancyApplicationStatus, string> = {
  PENDIENTE: "Pendiente",
  VISTO: "Visto",
  FINALIZADA: "Finalizado",
};

const APPLICATION_STATUS_DOT_CLASS: Record<VacancyApplicationStatus, string> = {
  PENDIENTE: "bg-chart-2",
  VISTO: "bg-chart-4",
  FINALIZADA: "bg-success",
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
