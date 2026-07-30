"use client";

// Fila de métricas del dashboard. Calcula los valores sobre los listados
// completos que trae el hook y resuelve el ícono como decisión de presentación.

import { BriefcaseBusinessIcon, Building2Icon, FileUserIcon, UsersIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMemo } from "react";

import { StatCard } from "@/features/moderacion/components/dashboard/stat-card";
import type {
  DashboardStat,
  DashboardStatId,
  DashboardStatsSource,
} from "@/features/moderacion/types";

const STAT_ICON: Record<DashboardStatId, LucideIcon> = {
  companies: Building2Icon,
  vacancies: BriefcaseBusinessIcon,
  applications: FileUserIcon,
  users: UsersIcon,
};

const NUMBER_FORMAT = new Intl.NumberFormat("es-UY");

export function StatsGrid({ source }: { source: DashboardStatsSource }) {
  const stats = useMemo(() => buildStats(source), [source]);

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

function buildStats({
  companies,
  vacancies,
  applications,
  users,
}: DashboardStatsSource): DashboardStat[] {
  const pendingCompanies = companies.filter(
    (company) => company.status === "PENDIENTE",
  ).length;
  const visibleVacancies = vacancies.filter((vacancy) => !vacancy.deleted);
  const publishedVacancies = visibleVacancies.filter(
    (vacancy) => vacancy.status === "PUBLICADO",
  ).length;
  const pendingApplications = applications.filter(
    (application) => application.status === "PENDIENTE",
  ).length;
  const studentUsers = users.filter((user) => user.role === "ALUMNO").length;
  const companyUsers = users.filter((user) => user.role === "EMPRESA").length;
  const adminUsers = users.filter((user) => user.role === "ADMIN").length;

  return [
    {
      id: "companies",
      title: "Empresas registradas",
      value: companies.length,
      description: formatCount(pendingCompanies, "pendiente", "pendientes"),
    },
    {
      id: "vacancies",
      title: "Ofertas publicadas",
      value: publishedVacancies,
      description: formatCount(visibleVacancies.length, "oferta total", "ofertas totales"),
    },
    {
      id: "applications",
      title: "Postulaciones",
      value: applications.length,
      description: formatCount(pendingApplications, "pendiente", "pendientes"),
    },
    {
      id: "users",
      title: "Usuarios registrados",
      value: users.length,
      description: [
        formatCount(studentUsers, "cuenta de estudiante", "cuentas de estudiantes"),
        formatCount(companyUsers, "cuenta de empresa", "cuentas de empresas"),
        formatCount(adminUsers, "cuenta de administrador", "cuentas de administradores"),
      ].join(" · "),
    },
  ];
}

function formatCount(count: number, singular: string, plural: string): string {
  return `${NUMBER_FORMAT.format(count)} ${count === 1 ? singular : plural}`;
}
