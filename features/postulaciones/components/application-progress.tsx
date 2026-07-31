// Barra de progreso de una postulación en "Mis postulaciones" (vista
// alumno): Pendiente → Visto → Finalizado.
//
// ⚠️ El tercer paso NO distingue seleccionado/no seleccionado. `accepted`
// (ex-`selected`) volvió al contrato — ver el aviso en `VacancyApplication`,
// `types/index.ts` — pero solo viaja en `VacancyApplicationResponse`, la que
// usan empresa/ADMIN. `GET /vacancy-application/me` (esta pantalla) devuelve
// `VacancyApplicationStudentResponse`, que NO lo incluye a propósito: el
// alumno sigue sin poder ver si quedó seleccionado. El paso solo puede
// mostrar que la postulación llegó a su fin.

import { CheckIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import type { VacancyApplication, VacancyApplicationStatus } from "@/types";

type StepState = "done" | "upcoming";

interface Step {
  label: string;
  state: StepState;
}

function buildSteps(status: VacancyApplicationStatus): Step[] {
  const seen = status === "VISTO" || status === "FINALIZADO";
  const closed = status === "FINALIZADO";

  return [
    { label: "Pendiente", state: "done" },
    { label: "Visto", state: seen ? "done" : "upcoming" },
    { label: "Finalizada", state: closed ? "done" : "upcoming" },
  ];
}

const CIRCLE_CLASS: Record<StepState, string> = {
  done: "border-primary bg-primary text-primary-foreground",
  upcoming: "border-border bg-background text-muted-foreground",
};

const LINE_CLASS: Record<StepState, string> = {
  done: "bg-primary",
  upcoming: "bg-border",
};

const LABEL_CLASS: Record<StepState, string> = {
  done: "text-foreground",
  upcoming: "text-muted-foreground",
};

export function ApplicationProgress({ application }: { application: VacancyApplication }) {
  const steps = buildSteps(application.status);
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
              {step.state === "done" && <CheckIcon className="size-3.5" aria-hidden />}
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
