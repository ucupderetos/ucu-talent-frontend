"use client";

// Acciones de una fila de la cola de validaciones: Aprobar / Rechazar una
// cuenta pendiente. Ambas piden confirmación en un diálogo; Rechazar exige un
// motivo (adminComment), que el backend le muestra al usuario. La mutación
// (use-review-account.ts) es andamio sobre fixtures hasta enchufar
// PATCH /user/{id} (A-02).

import { useState } from "react";
import { CheckIcon, XCircleIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { useReviewAccount } from "@/features/moderacion/hooks/use-review-account";
import type { ReviewAccountInput } from "@/features/moderacion/hooks/use-review-account";

type Action = "approve" | "reject";

export function ReviewActions({
  userId,
  displayName,
  accountType,
}: {
  userId: string;
  displayName: string;
  accountType: ReviewAccountInput["accountType"];
}) {
  const [action, setAction] = useState<Action | null>(null);
  const [reason, setReason] = useState("");
  const review = useReviewAccount();

  function close() {
    setAction(null);
    setReason("");
  }

  function confirm() {
    if (!action) return;
    const isReject = action === "reject";
    review.mutate(
      {
        userId,
        accountType,
        status: isReject ? "RECHAZADO" : "APROBADO",
        adminComment: isReject ? reason.trim() : undefined,
      },
      {
        onSuccess: () => {
          toast.success(isReject ? "Cuenta rechazada." : "Cuenta aprobada.");
          close();
        },
        onError: () => toast.error("No se pudo procesar. Intentá nuevamente."),
      },
    );
  }

  const isReject = action === "reject";
  const confirmDisabled = review.isPending || (isReject && reason.trim() === "");

  return (
    <>
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          className="border-success/30 text-success hover:bg-success/10 hover:text-success"
          onClick={() => setAction("approve")}
        >
          <CheckIcon />
          Aprobar
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => setAction("reject")}
        >
          <XCircleIcon />
          Rechazar
        </Button>
      </div>

      <Dialog open={action !== null} onOpenChange={(open) => !open && close()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isReject ? "Rechazar cuenta" : "Aprobar cuenta"}</DialogTitle>
            <DialogDescription>
              {isReject
                ? `Vas a rechazar la cuenta de ${displayName}. Contanos el motivo — se le muestra al usuario.`
                : `Vas a aprobar la cuenta de ${displayName}, que va a poder operar en la plataforma.`}
            </DialogDescription>
          </DialogHeader>

          {isReject && (
            <Field>
              <FieldLabel htmlFor="reject-reason">Motivo del rechazo</FieldLabel>
              <Textarea
                id="reject-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ej: la cédula no figura en el padrón de la universidad."
                className="min-h-24"
              />
            </Field>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={close} disabled={review.isPending}>
              Cancelar
            </Button>
            <Button
              onClick={confirm}
              disabled={confirmDisabled}
              className={
                isReject
                  ? "bg-destructive text-white hover:bg-destructive/90"
                  : "bg-success text-white hover:bg-success/90"
              }
            >
              {review.isPending
                ? isReject
                  ? "Rechazando..."
                  : "Aprobando..."
                : isReject
                  ? "Rechazar"
                  : "Aprobar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
