"use client";

// Acciones de moderación sobre una empresa, compartidas por la tabla y el
// detalle, con diálogo de confirmación.
//
// Escribe mediante `PATCH /user/{id}`. El estado de la empresa vive en User y
// CompanyResponse lo replica para presentar el perfil sin otra lectura.

import { useState } from "react";
import Link from "next/link";
import {
  BanIcon,
  Building2Icon,
  CheckIcon,
  CircleXIcon,
  MoreVerticalIcon,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { useReviewAccount } from "@/features/moderacion/hooks/use-review-account";
import type { AdminCompanyDetail } from "@/features/moderacion/types";
import { ApiError } from "@/lib/api-client";
import type { AccountStatus } from "@/types";

type CompanyModerationAction = "approve" | "reject" | "deactivate";

interface ActionConfig {
  triggerLabel: string;
  confirmLabel: string;
  pendingLabel: string;
  title: string;
  description: (companyName: string) => string;
  icon: LucideIcon;
  variant: "default" | "destructive";
  iconClassName: string;
  /** A qué `AccountStatus` lleva la acción. */
  status: Extract<AccountStatus, "APROBADO" | "RECHAZADO">;
  /** Si pide motivo, confirmar queda deshabilitado hasta que se escriba. */
  requiresReason: boolean;
  successMessage: string;
}

const ACTION_CONFIG: Record<CompanyModerationAction, ActionConfig> = {
  approve: {
    triggerLabel: "Aprobar empresa",
    confirmLabel: "Sí, aprobar",
    pendingLabel: "Aprobando...",
    title: "¿Aprobar esta empresa?",
    description: (companyName) =>
      `${companyName} quedará habilitada para publicar vacantes en la plataforma.`,
    icon: CheckIcon,
    variant: "default",
    iconClassName: "bg-primary/10 text-primary",
    status: "APROBADO",
    requiresReason: false,
    successMessage: "Empresa aprobada.",
  },
  reject: {
    triggerLabel: "Rechazar empresa",
    confirmLabel: "Sí, rechazar",
    pendingLabel: "Rechazando...",
    title: "¿Rechazar esta empresa?",
    description: (companyName) =>
      `${companyName} no podrá publicar vacantes mientras su cuenta esté rechazada.`,
    icon: CircleXIcon,
    variant: "destructive",
    iconClassName: "bg-destructive/10 text-destructive",
    status: "RECHAZADO",
    requiresReason: true,
    successMessage: "Empresa rechazada.",
  },
  deactivate: {
    triggerLabel: "Dar de baja",
    confirmLabel: "Sí, dar de baja",
    pendingLabel: "Dando de baja...",
    title: "¿Dar de baja esta empresa?",
    description: (companyName) =>
      `${companyName} dejará de estar aprobada y no podrá publicar nuevas vacantes.`,
    icon: BanIcon,
    variant: "destructive",
    iconClassName: "bg-destructive/10 text-destructive",
    status: "RECHAZADO",
    requiresReason: true,
    successMessage: "Empresa dada de baja.",
  },
};

const AVAILABLE_ACTIONS: Record<AccountStatus, CompanyModerationAction[]> = {
  PENDIENTE: ["approve", "reject"],
  APROBADO: ["deactivate"],
  // El backend permite rehabilitar una cuenta rechazada; solo prohíbe volver
  // a PENDIENTE una vez que ya fue revisada.
  RECHAZADO: ["approve"],
};

type CompanyModerationSubject = Pick<AdminCompanyDetail, "id" | "name" | "status">;

export function CompanyModerationActions({
  company,
  presentation = "buttons",
}: {
  company: CompanyModerationSubject;
  /** Menú compacto para tablas; botones visibles para la pantalla de detalle. */
  presentation?: "buttons" | "menu";
}) {
  const [action, setAction] = useState<CompanyModerationAction | null>(null);
  const [reason, setReason] = useState("");
  const review = useReviewAccount();

  const availableActions = AVAILABLE_ACTIONS[company.status];
  const config = action ? ACTION_CONFIG[action] : null;
  const ActionIcon = config?.icon;
  const confirmDisabled =
    review.isPending || Boolean(config?.requiresReason && reason.trim() === "");

  function openAction(nextAction: CompanyModerationAction) {
    setReason("");
    setAction(nextAction);
  }

  function close() {
    setAction(null);
    setReason("");
  }

  function handleConfirm() {
    if (!action || !config) return;

    review.mutate(
      {
        userId: company.id,
        accountType: "EMPRESA",
        status: config.status,
        adminComment: config.requiresReason ? reason.trim() : undefined,
      },
      {
        onSuccess: () => {
          toast.success(config.successMessage);
          close();
        },
        onError: (error) =>
          toast.error(
            error instanceof ApiError
              ? error.message
              : "No se pudo procesar. Intentá nuevamente.",
          ),
      },
    );
  }

  if (presentation === "buttons" && availableActions.length === 0) return null;

  return (
    <>
      {presentation === "menu" ? (
        <CompanyActionsMenu
          company={company}
          actions={availableActions}
          onSelect={openAction}
        />
      ) : (
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:justify-end">
          {availableActions.map((availableAction) => {
            const item = ACTION_CONFIG[availableAction];
            const Icon = item.icon;

            return (
              <Button
                key={availableAction}
                variant={item.variant}
                className="w-full sm:w-auto"
                type="button"
                onClick={() => openAction(availableAction)}
              >
                <Icon data-icon="inline-start" />
                {item.triggerLabel}
              </Button>
            );
          })}
        </div>
      )}

      <Dialog open={action !== null} onOpenChange={(open) => !open && close()}>
        <DialogContent className="sm:max-w-md">
          {config && ActionIcon && (
            <>
              <DialogHeader className="pr-8">
                <div
                  className={`flex size-10 items-center justify-center rounded-full ${config.iconClassName}`}
                >
                  <ActionIcon className="size-5" aria-hidden />
                </div>
                <DialogTitle className="text-lg">{config.title}</DialogTitle>
                <DialogDescription>{config.description(company.name)}</DialogDescription>
              </DialogHeader>

              {config.requiresReason && (
                <Field>
                  <FieldLabel htmlFor={`company-admin-comment-${company.id}-${action}`}>
                    Motivo
                  </FieldLabel>
                  <Textarea
                    id={`company-admin-comment-${company.id}-${action}`}
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    placeholder="Contale a la empresa por qué se toma esta decisión."
                    rows={3}
                  />
                  <FieldDescription>
                    Se guarda como comentario del Admin y la empresa puede verlo.
                  </FieldDescription>
                </Field>
              )}

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" type="button" className="w-full sm:w-auto">
                    Cancelar
                  </Button>
                </DialogClose>
                <Button
                  variant={config.variant}
                  type="button"
                  onClick={handleConfirm}
                  disabled={confirmDisabled}
                  className="w-full sm:w-auto"
                >
                  {review.isPending ? config.pendingLabel : config.confirmLabel}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function CompanyActionsMenu({
  company,
  actions,
  onSelect,
}: {
  company: CompanyModerationSubject;
  actions: CompanyModerationAction[];
  onSelect: (action: CompanyModerationAction) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Abrir acciones de ${company.name}`}
        >
          <MoreVerticalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem asChild>
          <Link href={`/moderacion/empresas/${company.id}`}>
            <Building2Icon />
            Ver empresa
          </Link>
        </DropdownMenuItem>

        {actions.length > 0 && <DropdownMenuSeparator />}

        {actions.map((action) => {
          const item = ACTION_CONFIG[action];
          const Icon = item.icon;

          return (
            <DropdownMenuItem
              key={action}
              variant={item.variant === "destructive" ? "destructive" : undefined}
              onSelect={() => onSelect(action)}
            >
              <Icon />
              {item.triggerLabel}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
