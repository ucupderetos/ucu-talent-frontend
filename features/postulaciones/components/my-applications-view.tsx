"use client";

// Orquestador de "Mis postulaciones" (vista alumno): junta sesión +
// postulaciones, arma los filtros en memoria y la lista de cards (anchas, una
// por fila, no en grilla — ver ApplicationCard). La page.tsx solo renderiza
// esto.

import { useMemo, useState } from "react";

import { EmptyState } from "@/components/layout/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/features/auth/hooks/use-session";
import { ApplicationCard } from "@/features/postulaciones/components/application-card";
import { MyApplicationsFilters } from "@/features/postulaciones/components/my-applications-filters";
import {
  useMyApplicationAreas,
  useMyApplications,
} from "@/features/postulaciones/hooks/use-my-applications";
import type { MyApplicationFilters, MyApplicationRow } from "@/features/postulaciones/types";

const DEFAULT_FILTERS: MyApplicationFilters = {};

export function MyApplicationsView() {
  const { user, isLoading: isLoadingSession } = useSession();
  const { data, isLoading: isLoadingApplications, isError } = useMyApplications(user?.userId);
  const [filters, setFilters] = useState<MyApplicationFilters>(DEFAULT_FILTERS);

  const isLoading = isLoadingSession || isLoadingApplications;
  const areas = useMyApplicationAreas(data);
  const filteredRows = useFilteredRows(data, filters);

  const hasAnyApplication = (data?.length ?? 0) > 0;

  return (
    <div className="flex flex-col gap-6">
      {!isLoading && !isError && hasAnyApplication && (
        <MyApplicationsFilters filters={filters} areas={areas} onChange={setFilters} />
      )}

      {isLoading && <ListSkeleton />}

      {!isLoading && isError && (
        <EmptyState
          title="No pudimos cargar tus postulaciones"
          description="Revisá tu conexión y volvé a intentar."
        />
      )}

      {!isLoading && !isError && !hasAnyApplication && (
        <EmptyState
          title="Todavía no te postulaste a ninguna vacante"
          description="Explorá el feed y postulate a las que te interesen."
        />
      )}

      {!isLoading && !isError && hasAnyApplication && filteredRows.length === 0 && (
        <EmptyState
          title="No hay postulaciones con esos filtros"
          description="Probá ajustando la búsqueda o los filtros."
        />
      )}

      {!isLoading && !isError && filteredRows.length > 0 && (
        <div className="flex flex-col gap-4">
          {filteredRows.map((row) => (
            <ApplicationCard key={row.application.vacancyApplicationId} row={row} />
          ))}
        </div>
      )}
    </div>
  );
}

function useFilteredRows(
  data: MyApplicationRow[] | undefined,
  filters: MyApplicationFilters,
): MyApplicationRow[] {
  return useMemo(() => {
    if (!data) return [];
    const search = filters.search?.trim().toLowerCase();

    return data.filter((row) => {
      if (search) {
        const haystack = `${row.vacancy.name} ${row.companyName}`.toLowerCase();
        if (!haystack.includes(search)) return false;
      }
      if (filters.statuses?.length && !filters.statuses.includes(row.application.status)) {
        return false;
      }
      if (filters.areaIds?.length && !filters.areaIds.includes(row.vacancy.areaId)) {
        return false;
      }
      return true;
    });
  }, [data, filters]);
}

function ListSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-40 rounded-xl" />
      ))}
    </div>
  );
}
