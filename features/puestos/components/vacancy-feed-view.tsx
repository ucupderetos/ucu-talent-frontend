"use client";

// Orquestador del feed de vacantes (vista alumno): junta filtros + datos y
// arma la grilla de cards. La page.tsx solo renderiza esto.

import { useMemo, useState } from "react";

import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { VacancyFeedCard } from "@/features/puestos/components/vacancy-feed-card";
import { VacancyFeedFilters } from "@/features/puestos/components/vacancy-feed-filters";
import { useFeedVacancies } from "@/features/puestos/hooks/use-feed-vacancies";
import type { FeedFilters } from "@/features/puestos/types";
import { MOCK_AREAS, MOCK_VACANCIES } from "@/lib/fixtures";

const DEFAULT_FILTERS: FeedFilters = {};

export function VacancyFeedView() {
  const [filters, setFilters] = useState<FeedFilters>(DEFAULT_FILTERS);
  const { data, isLoading, isError } = useFeedVacancies(filters);
  const { areas, contractTypes } = useFeedFilterOptions();

  const hasActiveFilters = Boolean(filters.search || filters.areaId || filters.contractType);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Vacantes destacadas"
        description="Encontrá oportunidades que se ajusten a tu perfil profesional."
      />

      <VacancyFeedFilters
        filters={filters}
        areas={areas}
        contractTypes={contractTypes}
        onChange={setFilters}
      />

      {isLoading && <GridSkeleton />}

      {!isLoading && isError && (
        <EmptyState
          title="No pudimos cargar las vacantes"
          description="Revisá tu conexión y volvé a intentar."
        />
      )}

      {!isLoading && !isError && data && data.length === 0 && (
        <EmptyState
          title={hasActiveFilters ? "No hay vacantes con esos filtros" : "Todavía no hay vacantes publicadas"}
          description={
            hasActiveFilters
              ? "Probá ajustando la búsqueda o los filtros."
              : "Volvé a revisar más tarde: las empresas publican nuevas oportunidades seguido."
          }
        />
      )}

      {!isLoading && !isError && data && data.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((vacancy) => (
            <VacancyFeedCard key={vacancy.vacancyId} vacancy={vacancy} />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Opciones de los selects de carrera/trabajo: se calculan sobre TODAS las
 * vacantes visibles (sin aplicar los filtros activos), para que el dropdown
 * no vaya perdiendo opciones a medida que se filtra — mismo criterio que
 * useCompanyVacancyOptions en company-vacancies-view.tsx.
 *
 * TODO(api): cuando exista el contrato, esto probablemente lo devuelva el
 * propio endpoint de filtros (facets) en vez de calcularse en el cliente.
 */
function useFeedFilterOptions() {
  return useMemo(() => {
    const visible = MOCK_VACANCIES.filter((vacancy) => vacancy.status === "PENDIENTE");
    const areaIds = new Set(visible.map((vacancy) => vacancy.areaId));
    const contractTypes = Array.from(new Set(visible.map((vacancy) => vacancy.contractType))).sort();

    return {
      areas: MOCK_AREAS.filter((area) => areaIds.has(area.areaId)),
      contractTypes,
    };
  }, []);
}

function GridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-56 rounded-xl" />
      ))}
    </div>
  );
}
