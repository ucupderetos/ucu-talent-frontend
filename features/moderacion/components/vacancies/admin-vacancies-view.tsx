"use client";

// Orquestador del listado de Ofertas. La ruta solo compone esta vista; el
// estado, el fetching y la paginación quedan dentro del dominio moderación.

import { useState } from "react";

import { TablePagination } from "@/components/filters/table-pagination";
import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { VacanciesFilters } from "@/features/moderacion/components/vacancies/vacancies-filters";
import { VacanciesTable } from "@/features/moderacion/components/vacancies/vacancies-table";
import {
  useAdminVacancies,
  useAdminVacancyCompanies,
} from "@/features/moderacion/hooks/use-admin-vacancies";
import type { AdminVacancyFilters } from "@/features/moderacion/types";

const DEFAULT_FILTERS: AdminVacancyFilters = { page: 1, perPage: 10 };

export function AdminVacanciesView() {
  const [filters, setFilters] = useState<AdminVacancyFilters>(DEFAULT_FILTERS);

  const { data, isLoading, isError } = useAdminVacancies(filters);
  const { data: companies = [] } = useAdminVacancyCompanies();
  const hasAnyVacancy = (data?.total ?? 0) > 0 || hasActiveFilters(filters);
  const activeFilterCount = countActiveFilters(filters);

  function changeFilters(nextFilters: AdminVacancyFilters) {
    setFilters((current) => ({
      ...nextFilters,
      perPage: current.perPage,
      page: 1,
    }));
  }

  function clearFilterFields() {
    setFilters((current) => ({
      ...current,
      companyIds: [],
      statuses: [],
      modalities: [],
      page: 1,
    }));
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Ofertas"
        description="Revisá las ofertas publicadas y moderá las que lo necesiten."
      />

      <VacanciesFilters
        filters={filters}
        companies={companies}
        activeCount={activeFilterCount}
        onChange={changeFilters}
        onClearFilters={clearFilterFields}
      />

      {isLoading && <TableSkeleton />}

      {!isLoading && isError && (
        <EmptyState
          title="No pudimos cargar las ofertas"
          description="Revisá tu conexión y volvé a intentar."
        />
      )}

      {!isLoading && !isError && data && data.items.length === 0 && (
        <EmptyState
          title={hasAnyVacancy ? "No se encontraron ofertas" : "Todavía no hay ofertas"}
          description={
            hasAnyVacancy
              ? "Probá cambiando la búsqueda o limpiando los filtros."
              : "Las ofertas van a aparecer acá a medida que las empresas las publiquen."
          }
        />
      )}

      {!isLoading && !isError && data && data.items.length > 0 && (
        <>
          <VacanciesTable vacancies={data.items} />
          <TablePagination
            page={data.page}
            perPage={data.perPage}
            total={data.total}
            itemLabel="ofertas"
            onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
            onPerPageChange={(perPage) =>
              setFilters((current) => ({ ...current, perPage, page: 1 }))
            }
          />
        </>
      )}
    </div>
  );
}

function hasActiveFilters(filters: AdminVacancyFilters): boolean {
  return Boolean(
    filters.search ||
      filters.companyIds?.length ||
      filters.statuses?.length ||
      filters.modalities?.length,
  );
}

/** La búsqueda no cuenta porque ya está visible fuera del popover. */
function countActiveFilters(filters: AdminVacancyFilters): number {
  return (
    (filters.companyIds?.length ?? 0) +
    (filters.statuses?.length ?? 0) +
    (filters.modalities?.length ?? 0)
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-2 rounded-xl border p-4">
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
    </div>
  );
}
