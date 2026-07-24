// Traducción visual de `VacancyStatus` al español que ve la empresa. Un solo
// lugar para no repetir el mapeo en tabla, filtros, etc.
//
// 🔴 El backend real hoy SOLO tiene `PENDIENTE | FINALIZADO` (ver el gap en
// `types/index.ts`): no existe "publicada"/"pausada"/"rechazada" todavía,
// aunque el MER de referencia ya los modela. `PENDIENTE` se etiqueta como
// "Activa" porque es el único estado no-terminal que el enum real permite —
// revisar esta traducción apenas el backend exponga los estados que faltan
// (A-14 en AGENTS.md).

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { VacancyStatus } from "@/types";

export const VACANCY_STATUS_LABEL: Record<VacancyStatus, string> = {
  PENDIENTE: "Activa",
  FINALIZADO: "Cerrada",
};

/** Bajada de una línea que acompaña al badge en la tabla. */
export const VACANCY_STATUS_DESCRIPTION: Record<VacancyStatus, string> = {
  PENDIENTE: "Visible para alumnos",
  FINALIZADO: "Finalizada",
};

const VACANCY_STATUS_DOT_CLASS: Record<VacancyStatus, string> = {
  PENDIENTE: "bg-success",
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
