"use client";

// Acciones de moderación sobre una vacante, con diálogo de confirmación.
//
// Solo se ofrecen las transiciones que NO son el estado actual: el Admin puede
// llevar la vacante a cualquiera de los 3 (types/index.ts). Pasarla a
// `FINALIZADO` es terminal, así que desde ahí no se ofrece nada más.

import { useState } from "react";
import { BanIcon, EyeIcon, EyeOffIcon, MoreVerticalIcon, type LucideIcon } from "lucide-react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useReviewVacancy } from "@/features/moderacion/hooks/use-review-vacancy";
import type { AdminVacancyRow } from "@/features/moderacion/types";
import type { VacancyStatus } from "@/types";

interface TransitionConfig {
  menuLabel: string;
  icon: LucideIcon;
  destructive: boolean;
  title: string;
  description: (vacancyName: string) => string;
  confirmLabel: string;
  pendingLabel: string;
  successMessage: string;
}

const TRANSITION: Record<VacancyStatus, TransitionConfig> = {
  PUBLICADO: {
    menuLabel: "Publicar",
    icon: EyeIcon,
    destructive: false,
    title: "¿Publicar esta oferta?",
    description: (name) => `${name} va a volver a estar visible en el feed de los alumnos.`,
    confirmLabel: "Sí, publicar",
    pendingLabel: "Publicando...",
    successMessage: "Oferta publicada.",
  },
  PENDIENTE: {
    menuLabel: "Retirar para revisión",
    icon: EyeOffIcon,
    destructive: false,
    title: "¿Retirar esta oferta?",
    description: (name) =>
      `${name} deja de verse en el feed hasta que la vuelvas a publicar. Las postulaciones ya recibidas no se pierden.`,
    confirmLabel: "Sí, retirar",
    pendingLabel: "Retirando...",
    successMessage: "Oferta retirada para revisión.",
  },
  FINALIZADO: {
    menuLabel: "Dar de baja",
    icon: BanIcon,
    destructive: true,
    title: "¿Dar de baja esta oferta?",
    description: (name) =>
      `${name} queda cerrada de forma definitiva: es un estado terminal y no se puede volver atrás.`,
    confirmLabel: "Sí, dar de baja",
    pendingLabel: "Dando de baja...",
    successMessage: "Oferta dada de baja.",
  },
};

/** Desde `FINALIZADO` no se sale: es terminal. */
const AVAILABLE_TRANSITIONS: Record<VacancyStatus, VacancyStatus[]> = {
  PUBLICADO: ["PENDIENTE", "FINALIZADO"],
  PENDIENTE: ["PUBLICADO", "FINALIZADO"],
  FINALIZADO: [],
};

export function VacancyActionsMenu({ vacancy }: { vacancy: AdminVacancyRow }) {
  const [target, setTarget] = useState<VacancyStatus | null>(null);
  const review = useReviewVacancy();

  const transitions = AVAILABLE_TRANSITIONS[vacancy.status];
  const config = target ? TRANSITION[target] : null;

  function confirm() {
    if (!target || !config) return;

    review.mutate(
      { vacancyId: vacancy.vacancyId, status: target },
      {
        onSuccess: () => {
          toast.success(config.successMessage);
          setTarget(null);
        },
        onError: () => toast.error("No se pudo procesar. Intentá nuevamente."),
      },
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Abrir acciones de ${vacancy.name}`}
            disabled={transitions.length === 0}
          >
            <MoreVerticalIcon />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-52">
          {transitions.map((status) => {
            const item = TRANSITION[status];
            const Icon = item.icon;

            return (
              <DropdownMenuItem
                key={status}
                variant={item.destructive ? "destructive" : undefined}
                onSelect={() => setTarget(status)}
              >
                <Icon />
                {item.menuLabel}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

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
