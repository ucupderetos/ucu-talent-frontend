"use client";

// Orquestador de "Postulaciones" (vista admin): arma el estado de
// filtros/orden/paginación que consumen los componentes de presentación. La
// page.tsx solo renderiza esto. Mismo patrón que
// `features/puestos/components/company-vacancies-view.tsx`.

import { useState } from "react";

import { EmptyState } from "@/components/layout/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { ListPagination } from "@/components/pagination/list-pagination";
import {
  useApplicationFilterOptions,
  useApplications,
} from "@/features/moderacion/hooks/use-applications";
import { ApplicationsFilters } from "@/features/moderacion/components/applications/applications-filters";
import { ApplicationsTable } from "@/features/moderacion/components/applications/applications-table";
import type { AdminApplicationFilters, AdminApplicationOrder } from "@/features/moderacion/types";

const DEFAULT_FILTERS: AdminApplicationFilters = { order: "recent", page: 1, perPage: 10 };

export function ApplicationsView() {
  // Filtrado inmediato (sin "Aplicar filtros"): cada cambio de filtro vuelve
  // a la página 1.
  const [filters, setFilters] = useState<AdminApplicationFilters>(DEFAULT_FILTERS);

  const { data, isLoading, isError } = useApplications(filters);
  const { vacancies, companies } = useApplicationFilterOptions();

  const hasAnyApplication = (data?.total ?? 0) > 0 || hasActiveFilters(filters);

  function updateFilters(next: AdminApplicationFilters) {
    setFilters({ ...next, page: 1 });
  }

  /** Vuelve a la página 1: con otro orden, la página en la que estabas muestra
   *  filas distintas — mismo criterio que `updateFilters` y `onPerPageChange`. */
  function changeOrder(order: AdminApplicationOrder) {
    setFilters((f) => ({ ...f, order, page: 1 }));
  }

  return (
    <div className="flex flex-col gap-6">
      <ApplicationsFilters
        filters={filters}
        vacancies={vacancies}
        companies={companies}
        onChange={updateFilters}
        onOrderChange={changeOrder}
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
        <div className="space-y-2">
          <ApplicationsTable rows={data.items} />
          <ListPagination
            page={data.page}
            perPage={data.perPage}
            total={data.total}
            itemLabel="postulaciones"
            onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
            onPerPageChange={(perPage) => setFilters((f) => ({ ...f, perPage, page: 1 }))}
          />
        </div>
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
