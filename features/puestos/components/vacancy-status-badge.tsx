// Traducción visual de `VacancyStatus` (MER, en inglés) al español que ve la
// empresa. Un solo lugar para no repetir el mapeo en tabla, filtros, etc.

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { VacancyStatus } from "@/types";

export const VACANCY_STATUS_LABEL: Record<VacancyStatus, string> = {
  published: "Publicada",
  pending: "Pendiente",
  paused: "Pausada",
  rejected: "Rechazada",
  closed: "Cerrada",
};

/** Bajada de una línea que acompaña al badge en la tabla. */
export const VACANCY_STATUS_DESCRIPTION: Record<VacancyStatus, string> = {
  published: "Activa",
  pending: "En revisión",
  paused: "Pausada",
  rejected: "No aprobada",
  closed: "Finalizada",
};

const VACANCY_STATUS_DOT_CLASS: Record<VacancyStatus, string> = {
  published: "bg-emerald-500",
  pending: "bg-amber-500",
  paused: "bg-sky-500",
  rejected: "bg-destructive",
  closed: "bg-muted-foreground",
};

export function VacancyStatusBadge({ status }: { status: VacancyStatus }) {
  return (
    <Badge variant="outline" className="gap-1.5">
      <span
        className={cn("size-1.5 shrink-0 rounded-full", VACANCY_STATUS_DOT_CLASS[status])}
        aria-hidden
      />
      {VACANCY_STATUS_LABEL[status]}
    </Badge>
  );
}
