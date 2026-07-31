"use client";

// Donut de postulaciones por estado.
//
// El porcentaje se DERIVA del total, no se recibe: cuando venía en el dato
// podía contradecir al `count` (y lo hacía — los tres sumaban 79% y el donut
// quedaba con una cuña vacía).

import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/layout/empty-state";
import { Separator } from "@/components/ui/separator";
import type { ApplicationStatusSummary } from "@/features/moderacion/types";
import type { VacancyApplicationStatus } from "@/types";

// Los colores salen de los tokens de globals.css, no de hexadecimales sueltos,
// y son los mismos que usa `application-status-badge.tsx` para este enum. El
// `conic-gradient` necesita un valor de color real, así que se referencian las
// CSS vars directo — por eso va `var(--…)` y no una clase de Tailwind.
const STATUS_COLOR: Record<VacancyApplicationStatus, { css: string; dotClass: string }> = {
  PENDIENTE: { css: "var(--chart-2)", dotClass: "bg-chart-2" },
  VISTO: { css: "var(--chart-4)", dotClass: "bg-chart-4" },
  FINALIZADO: { css: "var(--success)", dotClass: "bg-success" },
};

function percentageOf(count: number, total: number): number {
  return total === 0 ? 0 : Math.round((count / total) * 100);
}

function donutBackground(statuses: ApplicationStatusSummary[], total: number): string {
  let end = 0;

  const sections = statuses.map((item, index) => {
    const start = end;
    // El redondeo se usa solo para el texto. En el gráfico mantenemos la
    // proporción exacta y cerramos el último tramo en 100% para no dejar huecos.
    end =
      index === statuses.length - 1 ? 100 : start + (item.count / total) * 100;
    return `${STATUS_COLOR[item.status].css} ${start}% ${end}%`;
  });

  return `conic-gradient(${sections.join(", ")})`;
}

export function ApplicationsByStatus({ statuses }: { statuses: ApplicationStatusSummary[] }) {
  const total = statuses.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card className="flex flex-col overflow-hidden gap-0 py-0">
      <CardHeader className="gap-0 px-5 py-3">
        <CardTitle>Postulaciones por estado</CardTitle>
      </CardHeader>

      <Separator />

      <CardContent className="flex flex-1 items-center p-0">
        {total === 0 ? (
          <div className="p-5">
            <EmptyState
              title="Todavía no hay postulaciones"
              description="El desglose por estado va a aparecer acá."
            />
          </div>
        ) : (
          <div className="flex w-full flex-col gap-5 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div
              className="relative mx-auto size-44 shrink-0 rounded-full"
              style={{ background: donutBackground(statuses, total) }}
              role="img"
              aria-label="Distribución de postulaciones por estado"
            >
              <div className="absolute inset-9 rounded-full bg-card" />
            </div>

            <div className="w-full space-y-3">
              {statuses.map((item) => (
                <div key={item.status} className="flex items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={`size-3 shrink-0 rounded-full ${STATUS_COLOR[item.status].dotClass}`}
                      aria-hidden
                    />
                    <span className="truncate text-sm text-muted-foreground">{item.label}</span>
                  </div>

                  <span className="shrink-0 text-sm font-medium">
                    {percentageOf(item.count, total)}% ({item.count})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="mt-auto justify-center px-5 py-3">
        <Button asChild variant="link" className="h-auto p-0 text-primary">
          <Link href="/moderacion/postulaciones">Ver todas las postulaciones</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
