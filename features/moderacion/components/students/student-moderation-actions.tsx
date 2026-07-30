"use client";

// Acciones administrativas de un alumno, compartidas por la tabla y el
// detalle. Replica la máquina de estados de empresa porque `AccountStatus`
// pertenece a User y el mismo PATCH /user/{id} modera ambos tipos de cuenta:
// PENDIENTE → APROBADO/RECHAZADO; APROBADO → RECHAZADO (dar de baja).

import { useState } from "react";
import Link from "next/link";
import {
  BanIcon,
  CheckIcon,
  CircleXIcon,
  MoreVerticalIcon,
  UserRoundIcon,
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
import type { AccountStatus } from "@/types";

type StudentModerationAction = "approve" | "reject" | "deactivate";

interface ActionConfig {
  triggerLabel: string;
  confirmLabel: string;
  pendingLabel: string;
  title: string;
  description: (studentName: string) => string;
  icon: LucideIcon;
  variant: "default" | "destructive";
  iconClassName: string;
  status: Extract<AccountStatus, "APROBADO" | "RECHAZADO">;
  requiresReason: boolean;
  successMessage: string;
}

const ACTION_CONFIG: Record<StudentModerationAction, ActionConfig> = {
  approve: {
    triggerLabel: "Aprobar alumno",
    confirmLabel: "Sí, aprobar",
    pendingLabel: "Aprobando...",
    title: "¿Aprobar este alumno?",
    description: (studentName) =>
      `${studentName} quedará habilitado para postularse a vacantes en la plataforma.`,
    icon: CheckIcon,
    variant: "default",
    iconClassName: "bg-primary/10 text-primary",
    status: "APROBADO",
    requiresReason: false,
    successMessage: "Alumno aprobado.",
  },
  reject: {
    triggerLabel: "Rechazar alumno",
    confirmLabel: "Sí, rechazar",
    pendingLabel: "Rechazando...",
    title: "¿Rechazar este alumno?",
    description: (studentName) =>
      `${studentName} no podrá postularse mientras su cuenta esté rechazada.`,
    icon: CircleXIcon,
    variant: "destructive",
    iconClassName: "bg-destructive/10 text-destructive",
    status: "RECHAZADO",
    requiresReason: true,
    successMessage: "Alumno rechazado.",
  },
  deactivate: {
    triggerLabel: "Dar de baja",
    confirmLabel: "Sí, dar de baja",
    pendingLabel: "Dando de baja...",
    title: "¿Dar de baja este alumno?",
    description: (studentName) =>
      `${studentName} dejará de estar aprobado y no podrá realizar nuevas postulaciones.`,
    icon: BanIcon,
    variant: "destructive",
    iconClassName: "bg-destructive/10 text-destructive",
    status: "RECHAZADO",
    requiresReason: true,
    successMessage: "Alumno dado de baja.",
  },
};

const AVAILABLE_ACTIONS: Record<AccountStatus, StudentModerationAction[]> = {
  PENDIENTE: ["approve", "reject"],
  APROBADO: ["deactivate"],
  RECHAZADO: [],
};

interface StudentModerationActionsProps {
  userId: string;
  status: AccountStatus;
  displayName: string;
  /** Menú compacto para tablas; botones visibles para la pantalla de detalle. */
  presentation?: "buttons" | "menu";
}

export function StudentModerationActions({
  userId,
  status,
  displayName,
  presentation = "buttons",
}: StudentModerationActionsProps) {
  const [action, setAction] = useState<StudentModerationAction | null>(null);
  const [reason, setReason] = useState("");
  const review = useReviewAccount();

  const availableActions = AVAILABLE_ACTIONS[status];
  const config = action ? ACTION_CONFIG[action] : null;
  const ActionIcon = config?.icon;
  const confirmDisabled =
    review.isPending || Boolean(config?.requiresReason && reason.trim() === "");

  function openAction(nextAction: StudentModerationAction) {
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
        userId,
        accountType: "ALUMNO",
        status: config.status,
        adminComment: config.requiresReason ? reason.trim() : undefined,
      },
      {
        onSuccess: () => {
          toast.success(config.successMessage);
          close();
        },
        onError: () => toast.error("No se pudo procesar. Intentá nuevamente."),
      },
    );
  }

  if (presentation === "buttons" && availableActions.length === 0) return null;

  return (
    <>
      {presentation === "menu" ? (
        <ActionsMenu
          userId={userId}
          displayName={displayName}
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
                <DialogDescription>{config.description(displayName)}</DialogDescription>
              </DialogHeader>

              {config.requiresReason && (
                <Field>
                  <FieldLabel htmlFor={`student-admin-comment-${userId}-${action}`}>
                    Motivo
                  </FieldLabel>
                  <Textarea
                    id={`student-admin-comment-${userId}-${action}`}
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    placeholder="Explicá por qué se toma esta decisión."
                    rows={3}
                  />
                  <FieldDescription>
                    Se guarda como comentario del Admin y el alumno puede verlo.
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

function ActionsMenu({
  userId,
  displayName,
  actions,
  onSelect,
}: {
  userId: string;
  displayName: string;
  actions: StudentModerationAction[];
  onSelect: (action: StudentModerationAction) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Abrir acciones de ${displayName}`}
        >
          <MoreVerticalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem asChild>
          <Link href={`/moderacion/estudiantes/${userId}`}>
            <UserRoundIcon />
            Ver perfil
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
