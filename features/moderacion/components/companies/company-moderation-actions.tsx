"use client";

// Acciones de moderación sobre una empresa, con diálogo de confirmación.
//
// Escribe de verdad: usa `useReviewAccount`, el mismo hook que la pantalla de
// Validaciones. El estado de una empresa vive en `User.status`, así que
// aprobar/rechazar una empresa es exactamente la misma operación que sobre
// cualquier cuenta — wire: `PATCH /user/{id}` (A-02, resuelto). El hook todavía
// es un andamio sobre fixtures, pero el swap a `apiClient` está en un solo
// lugar y esta pantalla no se entera.

import { useState } from "react";
import { BanIcon, CheckIcon, CircleXIcon, type LucideIcon } from "lucide-react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { useReviewAccount } from "@/features/moderacion/hooks/use-review-account";
import type { AdminCompanyDetail } from "@/features/moderacion/types";
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

export function CompanyModerationActions({ company }: { company: AdminCompanyDetail }) {
  if (company.status === "RECHAZADO") {
    return null;
  }

  return (
    // `key` por acción: sin esto React reconcilia el diálogo nuevo contra el
    // viejo (mismo tipo de componente en la misma posición) y le hereda el
    // estado. Al aprobar, el diálogo de "Dar de baja" aparecía ya abierto.
    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:justify-end">
      {company.status === "PENDIENTE" ? (
        <>
          <CompanyActionDialog key="approve" company={company} action="approve" />
          <CompanyActionDialog key="reject" company={company} action="reject" />
        </>
      ) : (
        <CompanyActionDialog key="deactivate" company={company} action="deactivate" />
      )}
    </div>
  );
}

function CompanyActionDialog({
  company,
  action,
}: {
  company: AdminCompanyDetail;
  action: CompanyModerationAction;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const review = useReviewAccount();

  const config = ACTION_CONFIG[action];
  const Icon = config.icon;
  const confirmDisabled = review.isPending || (config.requiresReason && reason.trim() === "");

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setReason("");
  }

  function handleConfirm() {
    review.mutate(
      {
        userId: company.id,
        accountType: "company",
        status: config.status,
        adminComment: config.requiresReason ? reason.trim() : undefined,
      },
      {
        onSuccess: () => {
          toast.success(config.successMessage);
          handleOpenChange(false);
        },
        onError: () => toast.error("No se pudo procesar. Intentá nuevamente."),
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant={config.variant} className="w-full sm:w-auto" type="button">
          <Icon data-icon="inline-start" />
          {config.triggerLabel}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader className="pr-8">
          <div
            className={`flex size-10 items-center justify-center rounded-full ${config.iconClassName}`}
          >
            <Icon className="size-5" aria-hidden />
          </div>
          <DialogTitle className="text-lg">{config.title}</DialogTitle>
          <DialogDescription>{config.description(company.name)}</DialogDescription>
        </DialogHeader>

        {config.requiresReason && (
          <Field>
            <FieldLabel htmlFor="admin-comment">Motivo</FieldLabel>
            <Textarea
              id="admin-comment"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
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
      </DialogContent>
    </Dialog>
  );
}
