import Link from "next/link";

import type {
  ApplicationStatus,
  ApplicationStatusSummary,
} from "../../types";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type ApplicationsByStatusProps = {
  statuses: ApplicationStatusSummary[];
};

const statusConfig = {
  pending: {
    color: "#f59e0b",
    legendClassName: "bg-amber-500",
  },
 
  aproved: {
    color: "#10b981",
    legendClassName: "bg-emerald-500",
  },
  rejected: {
    color: "#ef4444",
    legendClassName: "bg-red-500",
  },
} satisfies Record<
  ApplicationStatus,
  {
    color: string;
    legendClassName: string;
  }
>;

function createDonutBackground(
  statuses: ApplicationStatusSummary[],
): string {
  let accumulatedPercentage = 0;

  const sections = statuses.map((item) => {
    const start = accumulatedPercentage;
    const end = accumulatedPercentage + item.percentage;

    accumulatedPercentage = end;

    return `${statusConfig[item.status].color} ${start}% ${end}%`;
  });

  return `conic-gradient(${sections.join(", ")})`;
}

export function ApplicationsByStatus({
  statuses,
}: ApplicationsByStatusProps) {
  const donutBackground = createDonutBackground(statuses);

  return (
    <Card className="flex h-full flex-col overflow-hidden py-0">
      <CardHeader className="px-5 py-2">
        <CardTitle className="text-base font-semibold text-slate-950">
          Postulaciones por estado
        </CardTitle>
      </CardHeader>

      <Separator />

      <CardContent className="flex-1 p-0">
        <div className="flex flex-col gap-5 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div
            className="relative mx-auto size-44 shrink-0 rounded-full"
            style={{ background: donutBackground }}
            role="img"
            aria-label="Distribución de postulaciones por estado"
          >
            <div className="absolute inset-9 rounded-full bg-white" />
          </div>

          <div className="w-full space-y-3">
            {statuses.map((item) => {
              const config = statusConfig[item.status];

              return (
                <div
                  key={item.status}
                  className="flex items-center justify-between gap-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={`size-3 shrink-0 rounded-full ${config.legendClassName}`}
                      aria-hidden="true"
                    />

                    <span className="truncate text-sm text-slate-700">
                      {item.label}
                    </span>
                  </div>

                  <span className="shrink-0 text-sm font-medium text-slate-950">
                    {item.percentage}% ({item.count})
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>

      <Separator />

      <CardFooter className="mt-auto justify-center px-5 py-3">
        <Button
          asChild
          variant="link"
          className="h-auto p-0 text-blue-600"
        >
          <Link href="/postulaciones">
            Ver todas las postulaciones
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}