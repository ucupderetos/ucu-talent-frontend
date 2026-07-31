// Etiquetas de empresa sobre el badge compartido de `AccountStatus`. La capa
// común conserva los colores; este wrapper adapta únicamente el género.

import { AccountStatusBadge } from "@/features/moderacion/components/account-status-badge";
import type { AccountStatus } from "@/types";

export const COMPANY_STATUS_LABEL: Record<AccountStatus, string> = {
  APROBADO: "Aprobada",
  PENDIENTE: "Pendiente",
  RECHAZADO: "Rechazada",
};

export function CompanyStatusBadge({ status }: { status: AccountStatus }) {
  return <AccountStatusBadge status={status} label={COMPANY_STATUS_LABEL[status]} />;
}
