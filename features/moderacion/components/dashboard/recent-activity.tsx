"use client";

// Feed de las tres altas más recientes entre alumnos, empresas y ofertas.

import Link from "next/link";
import {
  BriefcaseBusinessIcon,
  Building2Icon,
  FileUserIcon,
  ShieldCheckIcon,
  UserRoundCheckIcon,
  type LucideIcon,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/layout/empty-state";
import { Separator } from "@/components/ui/separator";
import { parseMontevideoDateTime } from "@/features/moderacion/date-utils";
import type { ActivityType, RecentActivityItem } from "@/features/moderacion/types";

// Colores por tokens `--chart-*`, no la paleta cruda de Tailwind — mismo
// criterio que los avatares de `applications-table.tsx`.
const ACTIVITY_CONFIG: Record<
  ActivityType,
  { icon: LucideIcon; className: string }
> = {
  company: {
    icon: Building2Icon,
    className: "bg-chart-1/15 text-chart-1",
  },
  vacancy: {
    icon: BriefcaseBusinessIcon,
    className: "bg-chart-2/15 text-chart-2",
  },
  application: {
    icon: FileUserIcon,
    className: "bg-chart-3/15 text-chart-3",
  },
  user: {
    icon: UserRoundCheckIcon,
    className: "bg-chart-4/15 text-chart-4",
  },
  validation: {
    icon: ShieldCheckIcon,
    className: "bg-chart-5/15 text-chart-5",
  },
};

const RELATIVE_TIME_FORMAT = new Intl.RelativeTimeFormat("es-UY", { numeric: "auto" });
const DATE_TIME_FORMAT = new Intl.DateTimeFormat("es-UY", {
  dateStyle: "short",
  timeStyle: "short",
});
const MINUTE_IN_MS = 60_000;
const HOUR_IN_MS = 60 * MINUTE_IN_MS;
const DAY_IN_MS = 24 * HOUR_IN_MS;

export function RecentActivity({ activities }: { activities: RecentActivityItem[] }) {
  return (
    <Card className="flex h-full flex-col overflow-hidden gap-0 py-0">
      <CardHeader className="gap-0 px-5 py-3">
        <CardTitle>Actividad reciente</CardTitle>
      </CardHeader>

      <Separator />

      <CardContent className="flex-1 p-0">
        {activities.length === 0 ? (
          <div className="p-5">
            <EmptyState
              title="Sin actividad reciente"
              description="Todavía no hay alumnos, empresas u ofertas para mostrar."
            />
          </div>
        ) : (
          activities.map((activity, index) => {
            const config = ACTIVITY_CONFIG[activity.type];
            const Icon = config.icon;

            return (
              <div key={activity.id}>
                <Link
                  href={activity.href}
                  className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-muted/50"
                  aria-label={`Ir a ${activity.title}`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={`flex size-10 shrink-0 items-center justify-center rounded-full ${config.className}`}
                    >
                      <Icon className="size-5" aria-hidden />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{activity.title}</p>
                      <p className="truncate text-sm text-muted-foreground">
                        {activity.description}
                      </p>
                    </div>
                  </div>

                  <time
                    dateTime={activity.occurredAt}
                    className="shrink-0 text-sm text-muted-foreground"
                  >
                    {formatActivityTime(activity.occurredAt)}
                  </time>
                </Link>

                {index < activities.length - 1 && <Separator />}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

function formatActivityTime(value: string): string {
  const date = parseMontevideoDateTime(value);
  if (!date) return "—";

  const difference = date.getTime() - Date.now();
  const absoluteDifference = Math.abs(difference);

  if (absoluteDifference < MINUTE_IN_MS) return "Ahora";
  if (absoluteDifference < HOUR_IN_MS) {
    return capitalizeRelativeTime(
      formatRelativeDifference(difference, MINUTE_IN_MS, "minute"),
    );
  }
  if (absoluteDifference < DAY_IN_MS) {
    return capitalizeRelativeTime(
      formatRelativeDifference(difference, HOUR_IN_MS, "hour"),
    );
  }
  if (absoluteDifference < 7 * DAY_IN_MS) {
    return capitalizeRelativeTime(
      formatRelativeDifference(difference, DAY_IN_MS, "day"),
    );
  }

  return DATE_TIME_FORMAT.format(date);
}

function formatRelativeDifference(
  difference: number,
  unitInMilliseconds: number,
  unit: Intl.RelativeTimeFormatUnit,
): string {
  const amount = Math.max(
    1,
    Math.round(Math.abs(difference) / unitInMilliseconds),
  );
  return RELATIVE_TIME_FORMAT.format(difference < 0 ? -amount : amount, unit);
}

function capitalizeRelativeTime(value: string): string {
  return value.charAt(0).toLocaleUpperCase("es-UY") + value.slice(1);
}
