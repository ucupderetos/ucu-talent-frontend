// Traducción visual de `VacancyStatus`. ÚNICA fuente para los 3 roles.
//
// Vive en components/ y no en un dominio porque lo leen `puestos` (empresa),
// `moderacion` (admin) y el dashboard, y `features/` no puede importar de otro
// dominio. Antes había dos constantes `VACANCY_STATUS_LABEL` con el mismo
// nombre y la misma firma pero contenido opuesto —una en puestos, otra en
// moderacion—, así que un import elegido por autocompletado invertía las
// etiquetas sin un solo error de compilación.
//
// Un solo vocabulario para todos: que la empresa y el Admin llamen distinto al
// mismo estado fue justamente el bug que esto viene a cerrar.

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { VacancyStatus } from "@/types";

export const VACANCY_STATUS_LABEL: Record<VacancyStatus, string> = {
  PUBLICADO: "Publicada",
  PENDIENTE: "En revisión",
  FINALIZADO: "Finalizada",
};

/** Bajada de una línea que acompaña al badge donde hay lugar (ej. la tabla de
 *  "Mis ofertas"). Describe la consecuencia del estado, no lo repite. */
export const VACANCY_STATUS_DESCRIPTION: Record<VacancyStatus, string> = {
  PUBLICADO: "Visible para alumnos",
  PENDIENTE: "Retirada por el Admin",
  FINALIZADO: "Cerrada, no admite postulaciones",
};

const VACANCY_STATUS_DOT_CLASS: Record<VacancyStatus, string> = {
  PUBLICADO: "bg-success",
  PENDIENTE: "bg-warning",
  FINALIZADO: "bg-muted-foreground",
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
