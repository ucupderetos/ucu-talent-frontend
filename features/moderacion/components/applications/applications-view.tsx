"use client";

// Orquestador de "Postulaciones" (vista admin): arma el estado de
// filtros/orden/paginación que consumen los componentes de presentación. La
// page.tsx solo renderiza esto. Mismo patrón que
// `features/puestos/components/company-vacancies-view.tsx`.

import { useMemo, useState } from "react";
import { DownloadIcon } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/layout/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TablePagination } from "@/components/filters/table-pagination";
import { useApplications } from "@/features/moderacion/hooks/use-applications";
import { ApplicationsFilters } from "@/features/moderacion/components/applications/applications-filters";
import { ApplicationsTable } from "@/features/moderacion/components/applications/applications-table";
import type { AdminApplicationFilters, AdminApplicationOrder } from "@/features/moderacion/types";
import { MOCK_APPLICATIONS, MOCK_COMPANIES, MOCK_VACANCIES } from "@/lib/fixtures";

const DEFAULT_FILTERS: AdminApplicationFilters = { order: "recent", page: 1, perPage: 10 };

export function ApplicationsView() {
  const [draftFilters, setDraftFilters] = useState<AdminApplicationFilters>(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<AdminApplicationFilters>(DEFAULT_FILTERS);

  const { data, isLoading, isError } = useApplications(appliedFilters);
  const { vacancies, companies } = useApplicationFilterOptions();

  const hasAnyApplication = (data?.total ?? 0) > 0 || hasActiveFilters(appliedFilters);
  const activeFilterCount = countActiveFilters(appliedFilters);

  function applyFilters() {
    setAppliedFilters((current) => ({
      ...current,
      search: draftFilters.search,
      vacancyIds: draftFilters.vacancyIds,
      companyIds: draftFilters.companyIds,
      statuses: draftFilters.statuses,
      page: 1,
    }));
  }

  function clearFilters() {
    setDraftFilters(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
  }

  /** Vuelve a la página 1: con otro orden, la página en la que estabas muestra
   *  filas distintas — mismo criterio que `applyFilters` y `onPerPageChange`. */
  function changeOrder(order: AdminApplicationOrder) {
    setDraftFilters((f) => ({ ...f, order }));
    setAppliedFilters((f) => ({ ...f, order, page: 1 }));
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Postulaciones"
        description="Visualizá todas las postulaciones realizadas a las ofertas publicadas."
        actions={
          <Button variant="outline">
            <DownloadIcon />
            Exportar
          </Button>
        }
      />

      <ApplicationsFilters
        filters={draftFilters}
        vacancies={vacancies}
        companies={companies}
        activeCount={activeFilterCount}
        onChange={setDraftFilters}
        onOrderChange={changeOrder}
        onApply={applyFilters}
        onClear={clearFilters}
        canApply={hasFilterFieldsChanged(draftFilters, appliedFilters)}
        canClear={hasActiveFilters(draftFilters) || hasActiveFilters(appliedFilters)}
      />

      {isLoading && <TableSkeleton />}

      {!isLoading && isError && (
        <EmptyState
          title="No pudimos cargar las postulaciones"
          description="Revisá tu conexión y volvé a intentar."
        />
      )}

      {!isLoading && !isError && data && data.items.length === 0 && (
        <EmptyState
          title={hasAnyApplication ? "No hay postulaciones con esos filtros" : "Todavía no hay postulaciones"}
          description={
            hasAnyApplication
              ? "Probá ajustando la búsqueda o los filtros."
              : "Las postulaciones van a aparecer acá a medida que se creen."
          }
        />
      )}

      {!isLoading && !isError && data && data.items.length > 0 && (
        <>
          <ApplicationsTable rows={data.items} />
          <TablePagination
            page={data.page}
            perPage={data.perPage}
            total={data.total}
            itemLabel="postulaciones"
            onPageChange={(page) => setAppliedFilters((f) => ({ ...f, page }))}
            onPerPageChange={(perPage) => setAppliedFilters((f) => ({ ...f, perPage, page: 1 }))}
          />
        </>
      )}
    </div>
  );
}

function hasActiveFilters(filters: AdminApplicationFilters): boolean {
  return Boolean(
    filters.search ||
      filters.vacancyIds?.length ||
      filters.companyIds?.length ||
      filters.statuses?.length,
  );
}

/** `search` no cuenta porque el input ya está siempre visible en la barra;
 *  `order` tampoco porque se aplica de inmediato (no pasa por el popover). */
function countActiveFilters(filters: AdminApplicationFilters): number {
  return (
    (filters.vacancyIds?.length ?? 0) +
    (filters.companyIds?.length ?? 0) +
    (filters.statuses?.length ?? 0)
  );
}

function hasFilterFieldsChanged(
  draft: AdminApplicationFilters,
  applied: AdminApplicationFilters,
): boolean {
  return (
    (draft.search ?? "") !== (applied.search ?? "") ||
    !sameValues(draft.vacancyIds, applied.vacancyIds) ||
    !sameValues(draft.companyIds, applied.companyIds) ||
    !sameValues(draft.statuses, applied.statuses)
  );
}

function sameValues<T>(a: T[] = [], b: T[] = []): boolean {
  if (a.length !== b.length) return false;
  const setB = new Set(b);
  return a.every((value) => setB.has(value));
}

/** Opciones de los MultiSelect: solo las ofertas/empresas que realmente
 *  tienen alguna postulación, para que el dropdown no ofrezca opciones
 *  vacías. Mismo criterio que `useCompanyVacancyOptions` en puestos. */
function useApplicationFilterOptions() {
  return useMemo(() => {
    const vacancyIds = new Set(MOCK_APPLICATIONS.map((a) => a.vacancyId));
    const vacancies = MOCK_VACANCIES.filter((v) => vacancyIds.has(v.vacancyId));
    const companyIds = new Set(vacancies.map((v) => v.companyId));
    const companies = MOCK_COMPANIES.filter((c) => companyIds.has(c.companyId));

    return { vacancies, companies };
  }, []);
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
