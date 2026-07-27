// Estado de aprobación de la empresa (`User.status`, `AccountStatus`) en su
// propia vista de perfil — hasta ahora "Perfil Empresa" no lo mostraba en
// ningún lado (feedback de QA en #15.2). No es un `CompanyStatusBadge` más
// (ese vive en moderacion y no se puede importar entre dominios, AGENTS.md):
// acá se optó por un tratamiento tipo alerta — ícono en círculo de color +
// título + bajada — porque un badge chico con un punto pasaba desapercibido
// para algo tan importante como si la empresa puede publicar vacantes o no.
// Mismo motivo de color (bg-x/10 text-x en un círculo) que ya usan los
// diálogos de moderación (company-moderation-actions.tsx) y el avatar de
// company-detail-view.tsx — no es un patrón nuevo, es el que ya existe para
// "ícono + severidad".

import { CheckCircle2Icon, ClockIcon, XCircleIcon, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import type { AccountStatus } from "@/types";

interface StatusConfig {
  icon: LucideIcon;
  label: string;
  message: string;
  iconClassName: string;
}

// RN-02 / RF-MOD-04: el estado no restringe el acceso, restringe la acción de
// publicar puestos — acá solo se informa, el gate en sí va en el punto de
// acción ("Crear nueva oferta"), no en esta pantalla.
const STATUS_CONFIG: Record<AccountStatus, StatusConfig> = {
  APROBADO: {
    icon: CheckCircle2Icon,
    label: "Cuenta aprobada",
    message: "Tu empresa está habilitada para publicar vacantes.",
    iconClassName: "bg-success/10 text-success",
  },
  PENDIENTE: {
    icon: ClockIcon,
    label: "Pendiente de aprobación",
    message:
      "Un administrador de UCU todavía no revisó tu cuenta. Vas a poder publicar vacantes cuando se apruebe.",
    iconClassName: "bg-warning/10 text-warning",
  },
  RECHAZADO: {
    icon: XCircleIcon,
    label: "Cuenta rechazada",
    message:
      "Tu cuenta no fue aprobada, así que no podés publicar vacantes. Actualizá tus datos y esperá una nueva revisión.",
    iconClassName: "bg-destructive/10 text-destructive",
  },
};

export function CompanyAccountStatusBanner({ status }: { status: AccountStatus }) {
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
