"use client";

// Orquestador de "Empresas" (vista admin): arma el estado de filtros y
// paginación que consumen los componentes de presentación. La page.tsx solo
// renderiza esto. Mismo patrón que `students-view.tsx` y `applications-view.tsx`.

import { useState } from "react";

import { EmptyState } from "@/components/layout/empty-state";
import { TablePagination } from "@/components/filters/table-pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { CompaniesFilters } from "@/features/moderacion/components/companies/companies-filters";
import { CompaniesTable } from "@/features/moderacion/components/companies/companies-table";
import {
  useAdminCompanies,
  useAdminCompanyIndustries,
  useAdminCompanyLocations,
} from "@/features/moderacion/hooks/use-admin-companies";
import type { AdminCompanyFilters } from "@/features/moderacion/types";

const DEFAULT_FILTERS: AdminCompanyFilters = { page: 1, perPage: 10 };

export function AdminCompaniesView() {
  // Filtrado inmediato (sin "Aplicar filtros"): cada cambio de filtro vuelve
  // a la página 1.
  const [filters, setFilters] = useState<AdminCompanyFilters>(DEFAULT_FILTERS);

  const { data, isLoading, isError } = useAdminCompanies(filters);
  const { data: industries = [] } = useAdminCompanyIndustries();
  const { data: locations = [] } = useAdminCompanyLocations();

  const hasAnyCompany = (data?.total ?? 0) > 0 || hasActiveFilters(filters);

  function updateFilters(next: AdminCompanyFilters) {
    setFilters({ ...next, page: 1 });
  }

  return (
    <div className="flex flex-col gap-6">
      <CompaniesFilters
        filters={filters}
        industries={industries}
        locations={locations}
        onChange={updateFilters}
      />

      {isLoading && <TableSkeleton />}

      {!isLoading && isError && (
        <EmptyState
          title="No pudimos cargar las empresas"
          description="Revisá tu conexión y volvé a intentar."
        />
      )}

      {!isLoading && !isError && data && data.items.length === 0 && (
        <EmptyState
          title={hasAnyCompany ? "No se encontraron empresas" : "Todavía no hay empresas"}
          description={
            hasAnyCompany
              ? "Probá cambiando la búsqueda o limpiando los filtros."
              : "Las empresas van a aparecer acá a medida que se registren."
          }
        />
      )}

      {!isLoading && !isError && data && data.items.length > 0 && (
        <>
          <CompaniesTable companies={data.items} />
          <TablePagination
            page={data.page}
            perPage={data.perPage}
            total={data.total}
            itemLabel="empresas"
            onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
            onPerPageChange={(perPage) => setFilters((f) => ({ ...f, perPage, page: 1 }))}
          />
        </>
      )}
    </div>
  );
}

function hasActiveFilters(filters: AdminCompanyFilters): boolean {
  return Boolean(
    filters.search ||
      filters.statuses?.length ||
      filters.industries?.length ||
      filters.locations?.length,
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
