"use client";

// Fila de métricas del dashboard. Los valores vienen del hook; acá solo se
// resuelve el ícono, que es decisión de presentación y no un dato que vaya a
// mandar el backend.

import { BriefcaseBusinessIcon, Building2Icon, FileUserIcon, UsersIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { StatCard } from "@/features/moderacion/components/dashboard/stat-card";
import type { DashboardStat } from "@/features/moderacion/types";

const STAT_ICON: Record<string, LucideIcon> = {
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
          weeklyChange={stat.weeklyChange}
          icon={STAT_ICON[stat.id] ?? FileUserIcon}
        />
      ))}
    </section>
  );
}
