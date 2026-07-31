// Estado de aprobación del alumno (`User.status`, `AccountStatus`) en su
// propia vista de perfil — igual que CompanyAccountStatusBanner (feedback de
// QA en #15.2), pero del lado alumno nunca se había construido. Mismo
// tratamiento tipo alerta (ícono en círculo + título + bajada) que la empresa,
// y misma copy que ya usa el gate de "Aplicar" en vacancy-detail-view.tsx
// (PENDING_STATUS_MESSAGE) para no tener dos redacciones distintas del mismo
// estado en la app.

import { CheckCircle2Icon, ClockIcon, XCircleIcon, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import type { AccountStatus } from "@/types";

interface StatusConfig {
  icon: LucideIcon;
  label: string;
  message: string;
  iconClassName: string;
}

// RN-16 / RF-AUT-06: el estado no restringe el acceso, restringe la acción de
// postularse — acá solo se informa, el gate en sí va en el punto de acción
// ("Aplicar"), no en esta pantalla.
const STATUS_CONFIG: Record<AccountStatus, StatusConfig> = {
  APROBADO: {
    icon: CheckCircle2Icon,
    label: "Cuenta aprobada",
    message: "Tu cuenta está habilitada para postularte a vacantes.",
    iconClassName: "bg-success/10 text-success",
  },
  PENDIENTE: {
    icon: ClockIcon,
    label: "Pendiente de aprobación",
    message: "Tu cuenta está pendiente de aprobación. Vas a poder postularte cuando se apruebe.",
    iconClassName: "bg-warning/10 text-warning",
  },
  RECHAZADO: {
    icon: XCircleIcon,
    label: "Cuenta rechazada",
    message: "Tu cuenta no fue aprobada, así que no podés postularte a vacantes.",
    iconClassName: "bg-destructive/10 text-destructive",
  },
};

export function StudentAccountStatusBanner({ status }: { status: AccountStatus }) {
  const { icon: Icon, label, message, iconClassName } = STATUS_CONFIG[status];

  return (
    <div className="flex items-start gap-3 rounded-lg border bg-muted/20 p-4">
      <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", iconClassName)}>
        <Icon className="size-5" aria-hidden />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
