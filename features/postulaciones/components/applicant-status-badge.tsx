// Traducción visual de `VacancyApplicationStatus` al español que ve la
// empresa. Un solo lugar para no repetir el mapeo en tabla, tabs y detalle.
//
// `PENDIENTE → VISTO` es automático al abrir el detalle (ver
// use-mark-applicant-viewed.ts). ⚠️ `VISTO → FINALIZADO` NO es automático —
// corrige una versión anterior de este comentario, que asumía una cascada al
// cerrar la vacante. Verificado contra el código fuente del backend
// (`VacancyApplicationServiceImpl`/`VacancyFinalizationNotifier`): cerrar el
// puesto solo dispara el mail de cierre a cada postulante, nunca toca
// `VacancyApplication.status` — ese último paso sigue siendo
// `PUT /vacancy-application/{id}`, la misma acción explícita de la empresa
// que el resto de las transiciones. Este badge es de solo lectura hoy porque
// el frontend todavía no tiene una acción para dispararlo, no porque el
// sistema lo haga solo.

import { Badge } from "@/components/ui/badge";
import { APPLICATION_STATUS_DOT_CLASS } from "@/components/vacancies/application-status-colors";
import { cn } from "@/lib/utils";
import type { VacancyApplicationStatus } from "@/types";

export const APPLICANT_STATUS_LABEL: Record<VacancyApplicationStatus, string> = {
  PENDIENTE: "Nuevo",
  VISTO: "En revisión",
  FINALIZADO: "Finalizado",
};

export function ApplicantStatusBadge({ status }: { status: VacancyApplicationStatus }) {
  return (
    <Badge variant="outline" className="gap-1.5">
      <span
        className={cn("size-1.5 shrink-0 rounded-full", APPLICATION_STATUS_DOT_CLASS[status])}
        aria-hidden
      />
      {APPLICANT_STATUS_LABEL[status]}
    </Badge>
  );
}
