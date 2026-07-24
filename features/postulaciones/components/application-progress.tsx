// Barra de progreso de una postulación en "Mis postulaciones" (vista
// alumno): Pendiente → Visto → Seleccionado/No seleccionado. El tercer paso
// no es un estado propio de `VacancyApplicationStatus` — se deriva de
// `FINALIZADO` + `selected` (RN: `selected` se setea en `VISTO` y queda
// congelado al finalizar, ver AGENTS.md — "Postulaciones").

import { CheckIcon, XIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import type { VacancyApplication } from "@/types";

type StepState = "done" | "selected" | "rejected" | "upcoming";

interface Step {
  label: string;
  state: StepState;
}

function buildSteps({ status, selected }: VacancyApplication): Step[] {
  const seen = status === "VISTO" || status === "FINALIZADO";
  const closed = status === "FINALIZADO";

  return [
    { label: "Pendiente", state: "done" },
    { label: "Visto", state: seen ? "done" : "upcoming" },
    {
      label: closed ? (selected ? "Seleccionado" : "No seleccionado") : "Resultado",
      state: closed ? (selected ? "selected" : "rejected") : "upcoming",
    },
  ];
}

/** `selected` (verde) es su propio estado, distinto de `done` (navy) — mismo
 *  criterio de color-por-punto que VacancyStatusBadge (emerald-500 = éxito). */
const CIRCLE_CLASS: Record<StepState, string> = {
  done: "border-primary bg-primary text-primary-foreground",
  selected: "border-emerald-500 bg-emerald-500 text-white",
  rejected: "border-destructive bg-destructive text-destructive-foreground",
  upcoming: "border-border bg-background text-muted-foreground",
};

const LINE_CLASS: Record<StepState, string> = {
  done: "bg-primary",
  selected: "bg-emerald-500",
  rejected: "bg-destructive",
  upcoming: "bg-border",
};

const LABEL_CLASS: Record<StepState, string> = {
  done: "text-foreground",
  selected: "text-emerald-600",
  rejected: "text-destructive",
  upcoming: "text-muted-foreground",
};

export function ApplicationProgress({ application }: { application: VacancyApplication }) {
  const steps = buildSteps(application);
  // Con columnas de ancho igual (`flex-1`), el centro de la primera/última
  // columna cae a `100 / (steps.length * 2)`% del borde — ahí es donde tiene
  // que arrancar/terminar la línea para no sobresalir de los círculos de las
  // puntas.
  const inset = `${100 / (steps.length * 2)}%`;

  return (
    <div className="relative pt-3" aria-label="Estado de la postulación">
      <div
        className="absolute top-6 flex -translate-y-1/2 items-center"
        style={{ left: inset, right: inset }}
      >
        {steps.slice(1).map((step, i) => (
          <div key={i} className={cn("h-0.5 flex-1", LINE_CLASS[step.state])} />
        ))}
      </div>

      <div className="relative flex">
        {steps.map((step) => (
          <div key={step.label} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
            <div
              className={cn(
                "relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full border-2",
                CIRCLE_CLASS[step.state],
              )}
            >
              {step.state === "rejected" && <XIcon className="size-3.5" aria-hidden />}
              {(step.state === "done" || step.state === "selected") && (
                <CheckIcon className="size-3.5" aria-hidden />
              )}
            </div>
            <span
              className={cn(
                "whitespace-nowrap text-center text-xs font-medium",
                LABEL_CLASS[step.state],
              )}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
