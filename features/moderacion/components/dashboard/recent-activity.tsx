"use client";

// Feed de actividad reciente del dashboard.
//
// Cada ítem linkea al LISTADO de admin que le corresponde, no a un detalle: no
// hay pantalla de detalle por empresa/oferta/usuario todavía, y un href a
// /empresas/{id} sería un 404. Cuando existan, se cambia el `href` de acá
// (y vuelve a hacer falta el id).

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
import type { ActivityType, RecentActivityItem } from "@/features/moderacion/types";

// Colores por tokens `--chart-*`, no la paleta cruda de Tailwind — mismo
// criterio que los avatares de `applications-table.tsx`.
const ACTIVITY_CONFIG: Record<
  ActivityType,
  { icon: LucideIcon; className: string; href: string }
> = {
  company: {
    icon: Building2Icon,
    className: "bg-chart-1/15 text-chart-1",
    href: "/moderacion/validaciones",
  },
  vacancy: {
    icon: BriefcaseBusinessIcon,
    className: "bg-chart-2/15 text-chart-2",
    href: "/moderacion/ofertas",
  },
  application: {
    icon: FileUserIcon,
    className: "bg-chart-3/15 text-chart-3",
    href: "/moderacion/postulaciones",
  },
  user: {
    icon: UserRoundCheckIcon,
    className: "bg-chart-4/15 text-chart-4",
    href: "/moderacion/usuarios",
  },
  validation: {
    icon: ShieldCheckIcon,
    className: "bg-chart-5/15 text-chart-5",
    href: "/moderacion/validaciones",
  },
};

export function RecentActivity({ activities }: { activities: RecentActivityItem[] }) {
  return (
    <Card className="flex h-full flex-col overflow-hidden py-0">
      <CardHeader className="px-5 py-3">
        <CardTitle>Actividad reciente</CardTitle>
      </CardHeader>

      <Separator />

      <CardContent className="flex-1 p-0">
        {activities.length === 0 ? (
          <div className="p-5">
            <EmptyState
              title="Sin actividad reciente"
              description="Los movimientos de la plataforma van a aparecer acá."
            />
          </div>
        ) : (
          activities.map((activity, index) => {
            const config = ACTIVITY_CONFIG[activity.type];
            const Icon = config.icon;

            return (
              <div key={activity.id}>
                <Link
                  href={config.href}
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

                  <time className="shrink-0 text-sm text-muted-foreground">{activity.time}</time>
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
