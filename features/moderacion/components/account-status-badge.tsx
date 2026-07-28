// Presentación compartida de `AccountStatus` para alumnos y empresas. Los
// colores representan el mismo estado de cuenta sin depender del tipo de
// perfil; el texto puede adaptarse al género desde el consumidor.

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AccountStatus } from "@/types";

export const ACCOUNT_STATUS_LABEL: Record<AccountStatus, string> = {
  APROBADO: "Aprobado",
  PENDIENTE: "Pendiente",
  RECHAZADO: "Rechazado",
};

const ACCOUNT_STATUS_DOT_CLASS: Record<AccountStatus, string> = {
  APROBADO: "bg-success",
  PENDIENTE: "bg-warning",
  RECHAZADO: "bg-destructive",
};

export function AccountStatusBadge({
  status,
  label = ACCOUNT_STATUS_LABEL[status],
}: {
  status: AccountStatus;
  label?: string;
}) {
  return (
    <Badge variant="outline" className="gap-1.5">
      <span
        className={cn("size-1.5 shrink-0 rounded-full", ACCOUNT_STATUS_DOT_CLASS[status])}
        aria-hidden
      />
      {label}
    </Badge>
  );
}
