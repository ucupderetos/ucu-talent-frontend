"use client";

// Orquestador del feed de vacantes (vista alumno): junta filtros + datos y
// arma la vista (grilla de cards o lista, según el toggle). La page.tsx solo
// renderiza esto.

import { useState } from "react";
import { LayoutGridIcon, ListIcon } from "lucide-react";

import { EmptyState } from "@/components/layout/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { VacancyFeedCard } from "@/features/puestos/components/vacancy-feed-card";
import { VacancyFeedFilters } from "@/features/puestos/components/vacancy-feed-filters";
import { VacancyFeedTable } from "@/features/puestos/components/vacancy-feed-table";
import { useFeedFilterOptions, useFeedVacancies } from "@/features/puestos/hooks/use-feed-vacancies";
import type { FeedFilters } from "@/features/puestos/types";

const DEFAULT_FILTERS: FeedFilters = {};

type ViewMode = "grid" | "list";

export function VacancyFeedView() {
  const [filters, setFilters] = useState<FeedFilters>(DEFAULT_FILTERS);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const { data, isLoading, isError } = useFeedVacancies(filters);
  const { areas, contractTypes } = useFeedFilterOptions();

  const hasActiveFilters = Boolean(
    filters.search || filters.areaIds?.length || filters.contractTypes?.length,
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <VacancyFeedFilters
          filters={filters}
          areas={areas}
          contractTypes={contractTypes}
          onChange={setFilters}
        />

        {/* Selector de vista: grilla (default) o lista. El seleccionado va en
            azul principal explícito (`bg-ucu-blue`) — mismo criterio que el
            botón de acción principal, ver "Colores" en AGENTS.md. */}
        <ToggleGroup
          type="single"
          variant="outline"
          spacing={0}
          value={viewMode}
          onValueChange={(value) => value && setViewMode(value as ViewMode)}
          className="shrink-0"
        >
          <ToggleGroupItem
            value="grid"
            aria-label="Ver en grilla"
            className="data-[state=on]:bg-ucu-blue data-[state=on]:text-white data-[state=on]:hover:bg-ucu-blue/90"
          >
            <LayoutGridIcon />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="list"
            aria-label="Ver en lista"
            className="data-[state=on]:bg-ucu-blue data-[state=on]:text-white data-[state=on]:hover:bg-ucu-blue/90"
          >
            <ListIcon />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {isLoading && (viewMode === "grid" ? <GridSkeleton /> : <ListSkeleton />)}

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
        viewMode === "grid" ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((vacancy) => (
              <VacancyFeedCard key={vacancy.vacancyId} vacancy={vacancy} />
            ))}
          </div>
        ) : (
          <VacancyFeedTable rows={data} />
        )
      )}
    </div>
  );
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

function ListSkeleton() {
  return (
    <div className="flex flex-col gap-2 overflow-hidden rounded-xl border p-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full rounded-md" />
      ))}
    </div>
  );
}
