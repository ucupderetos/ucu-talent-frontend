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
} from "@/features/moderacion/hooks/use-admin-companies";
import type { AdminCompanyFilters } from "@/features/moderacion/types";

const DEFAULT_FILTERS: AdminCompanyFilters = { page: 1, perPage: 10 };

export function AdminCompaniesView() {
  const [draftFilters, setDraftFilters] = useState<AdminCompanyFilters>(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<AdminCompanyFilters>(DEFAULT_FILTERS);

  const { data, isLoading, isError } = useAdminCompanies(appliedFilters);
  const { data: industries = [] } = useAdminCompanyIndustries();

  const hasAnyCompany = (data?.total ?? 0) > 0 || hasActiveFilters(appliedFilters);
  const activeFilterCount = countActiveFilters(appliedFilters);

  function applyFilters() {
    setAppliedFilters((current) => ({
      ...current,
      search: draftFilters.search,
      statuses: draftFilters.statuses,
      industries: draftFilters.industries,
      page: 1,
    }));
  }

  function clearFilters() {
    setDraftFilters(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
  }

  return (
    <div className="flex flex-col gap-6">
      <CompaniesFilters
        filters={draftFilters}
        industries={industries}
        activeCount={activeFilterCount}
        onChange={setDraftFilters}
        onApply={applyFilters}
        onClear={clearFilters}
        canApply={hasFilterFieldsChanged(draftFilters, appliedFilters)}
        canClear={hasActiveFilters(draftFilters) || hasActiveFilters(appliedFilters)}
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
            onPageChange={(page) => setAppliedFilters((f) => ({ ...f, page }))}
            onPerPageChange={(perPage) => setAppliedFilters((f) => ({ ...f, perPage, page: 1 }))}
          />
        </>
      )}
    </div>
  );
}

function hasActiveFilters(filters: AdminCompanyFilters): boolean {
  return Boolean(filters.search || filters.statuses?.length || filters.industries?.length);
}

/** `search` no cuenta porque el input ya está siempre visible en la barra. */
function countActiveFilters(filters: AdminCompanyFilters): number {
  return (filters.statuses?.length ?? 0) + (filters.industries?.length ?? 0);
}

function hasFilterFieldsChanged(
  draft: AdminCompanyFilters,
  applied: AdminCompanyFilters,
): boolean {
  return (
    (draft.search ?? "") !== (applied.search ?? "") ||
    !sameValues(draft.statuses, applied.statuses) ||
    !sameValues(draft.industries, applied.industries)
  );
}

function sameValues<T>(a: T[] = [], b: T[] = []): boolean {
  if (a.length !== b.length) return false;
  const setB = new Set(b);
  return a.every((value) => setB.has(value));
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
