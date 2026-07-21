import Link from "next/link";
import {
  BriefcaseBusiness,
  Building2,
  FileUser,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import type {
  ActivityType,
  RecentActivityItem,
} from "../../types";

type RecentActivityProps = {
  activities: RecentActivityItem[];
};

const activityConfig = {
  company: {
    icon: Building2,
    className: "bg-blue-50 text-blue-600",
    href: (id: number) => `/empresas/${id}`,
  },
  vacancy: {
    icon: BriefcaseBusiness,
    className: "bg-emerald-50 text-emerald-600",
    href: (id: number) => `/ofertas/${id}`,
  },
  application: {
    icon: FileUser,
    className: "bg-violet-50 text-violet-600",
    href: (id: number) => `/postulaciones/${id}`,
  },
  user: {
    icon: UserRoundCheck,
    className: "bg-amber-50 text-amber-600",
    href: (id: number) => `/usuarios/${id}`,
  },
  validation: {
    icon: ShieldCheck,
    className: "bg-cyan-50 text-cyan-600",
    href: (id: number) => `/validaciones/${id}`,
  },
} satisfies Record<
  ActivityType,
  {
    icon: typeof Building2;
    className: string;
    href: (id: number) => string;
  }
>;



export function RecentActivity({
  activities,
}: RecentActivityProps) {
  return (
    <Card className="overflow-hidden py-0">
      <CardHeader className="px-5 py-2">
        <CardTitle className="text-base font-semibold text-slate-950">
          Actividad reciente
        </CardTitle>
      </CardHeader>

      <Separator />

      <CardContent className="p-0">
        {activities.map((activity, index) => {
          const config = activityConfig[activity.type];
          const Icon = config.icon;
          const href = config.href(activity.id);

          return (
            <div key={activity.id}>
              <Link
                href={href}
                className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-slate-50"
                aria-label={`Ver detalle de ${activity.title}`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={`flex size-10 shrink-0 items-center justify-center rounded-full ${config.className}`}
                  >
                    <Icon
                      className="size-5"
                      aria-hidden="true"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-950">
                      {activity.title}
                    </p>

                    <p className="truncate text-sm text-slate-500">
                      {activity.description}
                    </p>
                  </div>
                </div>

                <time className="shrink-0 text-sm text-slate-500">
                  {activity.time}
                </time>
              </Link>

              {index < activities.length - 1 && (
                <Separator />
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}