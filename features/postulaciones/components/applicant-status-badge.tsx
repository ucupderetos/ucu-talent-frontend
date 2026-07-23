// Traducción visual de `VacancyApplicationStatus` al español que ve la
// empresa. Un solo lugar para no repetir el mapeo en tabla, tabs y detalle.
//
// El estado nunca lo cambia la empresa a mano: `PENDIENTE → VISTO` es
// automático al abrir el detalle (ver use-mark-applicant-viewed.ts) y
// `VISTO → FINALIZADO` es automático al cerrar la vacante (lo dispara el
// sistema). Por eso este badge es de solo lectura en toda la pantalla.

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { VacancyApplicationStatus } from "@/types";

export const APPLICANT_STATUS_LABEL: Record<VacancyApplicationStatus, string> = {
  PENDIENTE: "Nuevo",
  VISTO: "En revisión",
  FINALIZADO: "Finalizado",
};

const APPLICANT_STATUS_DOT_CLASS: Record<VacancyApplicationStatus, string> = {
  PENDIENTE: "bg-emerald-500",
  VISTO: "bg-amber-500",
  FINALIZADO: "bg-muted-foreground",
};

export function ApplicantStatusBadge({ status }: { status: VacancyApplicationStatus }) {
  return (
    <Badge variant="outline" className="gap-1.5">
      <span
        className={cn("size-1.5 shrink-0 rounded-full", APPLICANT_STATUS_DOT_CLASS[status])}
        aria-hidden
      />
      {APPLICANT_STATUS_LABEL[status]}
    </Badge>
  );
}
