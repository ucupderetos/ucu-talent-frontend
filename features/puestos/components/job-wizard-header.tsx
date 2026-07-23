"use client";

import Link from "next/link";
import { CheckIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { useCreateJobForm } from "@/features/puestos/hooks/use-create-job-form";

export const JOB_WIZARD_STEPS = [
  { number: 1, label: "Información básica", href: "/crear-oferta/informacion-basica" },
  { number: 2, label: "Detalles del puesto", href: "/crear-oferta/detalles-puesto" },
  { number: 3, label: "Revisión y publicación", href: "/crear-oferta/revision" },
] as const;

/** Barra de progreso del wizard: círculos numerados conectados por líneas.
 *  Los pasos ya completados son clickeables para volver atrás y editar —
 *  el paso actual y los futuros NO son clickeables, así no se puede saltar
 *  adelante sin pasar por la validación de "Siguiente" de cada paso.
 *
 *  En mobile (<640px) el label de los pasos no actuales se oculta, para no
 *  desbordar el contenedor; el conector también se achica. */
export function JobWizardSteps({ currentStep }: { currentStep: number }) {
  const { furthestStep } = useCreateJobForm();

  return (
    <ol className="flex items-center gap-3 overflow-x-auto sm:gap-10">
      {JOB_WIZARD_STEPS.map((step, index) => {
        const isCompleted = step.number < currentStep;
        const isCurrent = step.number === currentStep;
        const isClickable = step.number <= furthestStep && step.number !== currentStep;

        const circle = (
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
        );

        const label = (
          <span
            className={cn(
              "text-sm",
              isCurrent ? "font-medium text-foreground" : "hidden text-muted-foreground sm:inline",
            )}
          >
            {step.label}
          </span>
        );

        return (
          <li key={step.number} className="flex shrink-0 items-center gap-3 sm:gap-10">
            {index > 0 && <span className="h-px w-6 shrink-0 bg-border sm:w-20" aria-hidden />}
            {isClickable ? (
              <Link href={step.href} className="flex items-center gap-2 hover:opacity-70">
                {circle}
                {label}
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                {circle}
                {label}
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

/** Header del wizard: título + descripción (reusa PageHeader) con la barra
 *  de pasos debajo. Los botones de acción viven en cada página. */
export function JobWizardHeader({ currentStep }: { currentStep: number }) {
  return (
    <>
      <PageHeader
        title="Crear nueva oferta"
        description="Completá la información del puesto. Podrás revisarla antes de publicarla."
      />
      <div className="mb-6">
        <JobWizardSteps currentStep={currentStep} />
      </div>
    </>
  );
}