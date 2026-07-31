"use client";

// Acciones de moderación sobre una vacante, con diálogo de confirmación.
//
// ⚠️ El Admin SOLO mueve `PUBLICADO ↔ PENDIENTE` (docs/ENDPOINTS.md,
// `PUT /vacancy/status/{id}`) — "dar de baja" para el Admin es
// `PUBLICADO → PENDIENTE`, no un cierre terminal. Pasar a `FINALIZADO` es una
// acción exclusiva de la empresa dueña (`PATCH /vacancy/status/{id}`, dominio
// `puestos`); este menú de Admin nunca la ofrece. Ver `VacancyStatus` en
// `types/index.ts`.

import { useState } from "react";
import Link from "next/link";
import {
  BriefcaseBusinessIcon,
  EyeIcon,
  EyeOffIcon,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import { VACANCY_STATUS_LABEL } from "@/components/vacancies/vacancy-status-badge";
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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useReviewVacancy } from "@/features/moderacion/hooks/use-review-vacancy";
import { ApiError } from "@/lib/api-client";
import type { AdminVacancyRow } from "@/features/moderacion/types";
import type { VacancyStatus } from "@/types";

/** Los dos únicos targets que el Admin puede elegir — nunca `FINALIZADO`
 *  (ver el aviso de arriba). */
type AdminVacancyTarget = Extract<VacancyStatus, "PUBLICADO" | "PENDIENTE">;

interface TransitionConfig {
  label: string;
  icon: LucideIcon;
  destructive: boolean;
  title: string;
  description: (vacancyName: string) => string;
  confirmLabel: string;
  pendingLabel: string;
  successMessage: string;
}

const TRANSITION: Record<AdminVacancyTarget, TransitionConfig> = {
  PUBLICADO: {
    label: "Publicar",
    icon: EyeIcon,
    destructive: false,
    title: "¿Publicar esta oferta?",
    description: (name) => `${name} va a volver a estar visible en el feed de los alumnos.`,
    confirmLabel: "Sí, publicar",
    pendingLabel: "Publicando...",
    successMessage: "Oferta publicada.",
  },
  PENDIENTE: {
    label: "Dar de baja",
    icon: EyeOffIcon,
    destructive: true,
    title: "¿Dar de baja esta oferta?",
    description: (name) =>
      `${name} deja de verse en el feed hasta que la vuelvas a publicar. Las postulaciones ya recibidas no se pierden — no es un cierre definitivo.`,
    confirmLabel: "Sí, dar de baja",
    pendingLabel: "Dando de baja...",
    successMessage: "Oferta retirada para revisión.",
  },
};

/** Desde `FINALIZADO` no se sale: es terminal, y el Admin no puede llegar a él
 *  (solo la empresa dueña lo hace, desde el dominio `puestos`). */
const AVAILABLE_TRANSITIONS: Record<VacancyStatus, AdminVacancyTarget[]> = {
  PUBLICADO: ["PENDIENTE"],
  PENDIENTE: ["PUBLICADO"],
  FINALIZADO: [],
};

// Una sola presentación en todos lados: iconos con tooltip, igual que en
// `company-moderation-actions.tsx` y `student-moderation-actions.tsx`.
export function VacancyActions({
  vacancy,
  includeDetailLink = false,
}: {
  vacancy: AdminVacancyRow;
  /** El icono "Ver oferta" navega al detalle: solo tiene sentido desde una
   *  tabla. En la propia pantalla de detalle apuntaría a sí misma. */
  includeDetailLink?: boolean;
}) {
  const [target, setTarget] = useState<AdminVacancyTarget | null>(null);
  const review = useReviewVacancy();

  const transitions = AVAILABLE_TRANSITIONS[vacancy.status];
  const config = target ? TRANSITION[target] : null;

  function confirm() {
    if (!target || !config) return;

    review.mutate(
      {
        vacancyId: vacancy.vacancyId,
        status: target,
        // El backend reemplaza el comentario incluso cuando no se manda. La
        // UI actual no edita motivos, así que preservamos el valor existente.
        adminComment: vacancy.adminComment ?? undefined,
      },
      {
        onSuccess: () => {
          toast.success(config.successMessage);
          setTarget(null);
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

  return (
    <>
      <div className="flex items-center gap-1">
        {includeDetailLink && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" asChild>
                <Link
                  href={`/moderacion/ofertas/${vacancy.vacancyId}`}
                  aria-label={`Ver oferta ${vacancy.name}`}
                >
                  <BriefcaseBusinessIcon className="size-4" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Ver oferta</TooltipContent>
          </Tooltip>
        )}

        {transitions.map((status) => {
          const item = TRANSITION[status];
          const Icon = item.icon;

          return (
            <Tooltip key={status}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={item.destructive ? "text-destructive hover:text-destructive" : undefined}
                  aria-label={`${item.label} ${vacancy.name}`}
                  onClick={() => setTarget(status)}
                >
                  <Icon className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{item.label}</TooltipContent>
            </Tooltip>
          );
        })}
      </div>

      <Dialog open={target !== null} onOpenChange={(open) => !open && setTarget(null)}>
        <DialogContent className="sm:max-w-md">
          {config && (
            <>
              <DialogHeader className="pr-8">
                <DialogTitle className="text-lg">{config.title}</DialogTitle>
                <DialogDescription>
                  {config.description(vacancy.name)} Pasa de{" "}
                  <strong>{VACANCY_STATUS_LABEL[vacancy.status]}</strong> a{" "}
                  <strong>{VACANCY_STATUS_LABEL[target!]}</strong>.
                </DialogDescription>
              </DialogHeader>

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" type="button" className="w-full sm:w-auto">
                    Cancelar
                  </Button>
                </DialogClose>
                <Button
                  variant={config.destructive ? "destructive" : "default"}
                  type="button"
                  onClick={confirm}
                  disabled={review.isPending}
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
