import { Badge } from "@/components/ui/badge";
import { VACANCY_STATUS_LABEL } from "@/features/moderacion/components/vacancies/vacancy-labels";
import { cn } from "@/lib/utils";
import type { VacancyStatus } from "@/types";

const VACANCY_STATUS_DOT_CLASS: Record<VacancyStatus, string> = {
  PENDIENTE: "bg-warning",
  FINALIZADO: "bg-muted-foreground",
};

export function AdminVacancyStatusBadge({ status }: { status: VacancyStatus }) {
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
