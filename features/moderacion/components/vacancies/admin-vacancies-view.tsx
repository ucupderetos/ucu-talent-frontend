"use client";

// Orquestador del listado de Ofertas. La ruta solo compone esta vista; el
// estado, el fetching y la paginación quedan dentro del dominio moderación.

import { useState } from "react";

import { TablePagination } from "@/components/filters/table-pagination";
import { EmptyState } from "@/components/layout/empty-state";
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

  function changeFilters(nextFilters: AdminVacancyFilters) {
    setFilters((current) => ({
      ...nextFilters,
      perPage: current.perPage,
      page: 1,
    }));
  }

  return (
    <div className="flex flex-col gap-6">
      <VacanciesFilters filters={filters} companies={companies} onChange={changeFilters} />

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
