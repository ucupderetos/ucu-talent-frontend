"use client";

// Fila de métricas del dashboard. Los valores ya vienen calculados por
// `use-dashboard.ts` desde `GET /admin/dashboard`; este componente solo
// resuelve el ícono de presentación por `id`.

import { BriefcaseBusinessIcon, Building2Icon, FileUserIcon, UsersIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { StatCard } from "@/features/moderacion/components/dashboard/stat-card";
import type { DashboardStat, DashboardStatId } from "@/features/moderacion/types";

const STAT_ICON: Record<DashboardStatId, LucideIcon> = {
  companies: Building2Icon,
  vacancies: BriefcaseBusinessIcon,
  applications: FileUserIcon,
  users: UsersIcon,
};

export function StatsGrid({ stats }: { stats: DashboardStat[] }) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Resumen general">
      {stats.map((stat) => (
        <StatCard
          key={stat.id}
          title={stat.title}
          value={stat.value}
          description={stat.description}
          icon={STAT_ICON[stat.id]}
        />
      ))}
    </section>
  );
}
