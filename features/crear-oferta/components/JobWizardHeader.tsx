"use client";

import { CheckIcon, ArrowRightIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";

export const JOB_WIZARD_STEPS = [
  { number: 1, label: "Información básica", href: "/crear-oferta/informacion-basica" },
  { number: 2, label: "Detalles del puesto", href: "/crear-oferta/detalles-del-puesto" },
  { number: 3, label: "Revisión y publicación", href: "/crear-oferta/revision" },
] as const;

/** Barra de progreso del wizard: círculos numerados conectados por líneas.
 *  `currentStep` es el número de paso activo (1, 2 o 3). Los pasos anteriores
 *  al activo se muestran como completados (con check), no clickeables todavía
 *  — la navegación hacia atrás se resuelve con los botones de cada paso, no
 *  clickeando el indicador (evita saltar a un paso sin completar el actual). */
export function JobWizardSteps({ currentStep }: { currentStep: number }) {
  return (
    <ol className="flex items-center gap-3">
      {JOB_WIZARD_STEPS.map((step, index) => {
        const isCompleted = step.number < currentStep;
        const isCurrent = step.number === currentStep;

        return (
          <li key={step.number} className="flex items-center gap-3">
            {index > 0 && <span className="h-px w-10 bg-border" aria-hidden />}
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-medium",
                  isCurrent && "bg-primary text-primary-foreground",
                  isCompleted && "bg-primary/20 text-primary",
                  !isCurrent && !isCompleted && "bg-muted text-muted-foreground",
                )}
              >
                {isCompleted ? <CheckIcon className="size-4" /> : step.number}
              </span>
              <span
                className={cn(
                  "text-sm",
                  isCurrent ? "font-medium text-foreground" : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
/** Header del wizard: título + descripción + acciones (reusa PageHeader),
 *  con la barra de pasos debajo. Se usa igual en los 3 pasos. */
export function JobWizardHeader({
  currentStep,
  nextStepLabel,
  onSaveDraft,
  onNext,
  isNextDisabled,
}: {
  currentStep: number;
  /** Texto del botón principal, ej. "Siguiente: Detalles del puesto". */
  nextStepLabel: string;
  onSaveDraft: () => void;
  onNext: () => void;
  isNextDisabled?: boolean;
}) {
  return (
    <>
      <PageHeader
        title="Crear nueva oferta"
        description="Completá la información del puesto. Podrás revisarla antes de enviarla a revisión."
        actions={
          <>
            <Button type="button" variant="outline" onClick={onSaveDraft}>
              Guardar borrador
            </Button>
            <Button type="button" onClick={onNext} disabled={isNextDisabled} className="gap-2">
              {nextStepLabel}
              <ArrowRightIcon className="size-4" />
            </Button>
          </>
        }
      />
      <div className="mb-6">
        <JobWizardSteps currentStep={currentStep} />
      </div>
    </>
  );
}