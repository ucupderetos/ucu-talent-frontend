// Traducción visual de `AccountStatus` para una empresa. Un solo lugar para no
// repetir el mapeo en tabla, filtros y detalle — mismo patrón que
// `application-status-badge.tsx`.
//
// Los colores van por token semántico, no por la paleta cruda de Tailwind: así
// no hace falta declarar variantes `dark:` a mano, los tokens ya resuelven en
// los dos temas.

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AccountStatus } from "@/types";

export const COMPANY_STATUS_LABEL: Record<AccountStatus, string> = {
  APROBADO: "Aprobada",
  PENDIENTE: "Pendiente",
  RECHAZADO: "Rechazada",
};

const COMPANY_STATUS_DOT_CLASS: Record<AccountStatus, string> = {
  APROBADO: "bg-success",
  PENDIENTE: "bg-warning",
  RECHAZADO: "bg-destructive",
};

export function CompanyStatusBadge({ status }: { status: AccountStatus }) {
  return (
    <Badge variant="outline" className="gap-1.5">
      <span
        className={cn("size-1.5 shrink-0 rounded-full", COMPANY_STATUS_DOT_CLASS[status])}
        aria-hidden
      />
      {COMPANY_STATUS_LABEL[status]}
    </Badge>
  );
}
