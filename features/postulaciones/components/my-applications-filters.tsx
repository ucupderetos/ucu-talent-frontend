"use client";

// Barra de filtros de "Mis postulaciones" (vista alumno): búsqueda + un botón
// único "Filtros" que abre un panel con dos MultiSelect (estado, carrera).
// Mismo patrón que VacancyFeedFilters
// (features/puestos/components/vacancy-feed-filters.tsx) — ver AGENTS.md,
// "Barras de filtros / toolbars".

import { FilterIcon, SearchIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { FilterPopoverContent, FilterSection } from "@/components/filters/filter-popover";
import { MultiSelect } from "@/components/filters/multi-select";
import { APPLICATION_STATUS_LABEL } from "@/features/postulaciones/components/application-status-badge";
import type { MyApplicationFilters } from "@/features/postulaciones/types";
import type { Area, VacancyApplicationStatus } from "@/types";

const STATUS_OPTIONS: VacancyApplicationStatus[] = ["PENDIENTE", "VISTO", "FINALIZADO"];

export function MyApplicationsFilters({
  filters,
  areas,
  onChange,
}: {
  filters: MyApplicationFilters;
  areas: Area[];
  onChange: (filters: MyApplicationFilters) => void;
}) {
  const activeCount = (filters.statuses?.length ?? 0) + (filters.areaIds?.length ?? 0);

  function clearAll() {
    onChange({ ...filters, statuses: [], areaIds: [] });
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="relative w-full sm:w-64">
        <SearchIcon
          className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          value={filters.search ?? ""}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          placeholder="Buscar entre tus postulaciones…"
          className="pl-8"
          aria-label="Buscar postulaciones"
        />
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">
            <FilterIcon />
            Filtros
            {activeCount > 0 && <Badge variant="secondary">{activeCount}</Badge>}
          </Button>
        </PopoverTrigger>
        <FilterPopoverContent activeCount={activeCount} onClearAll={clearAll}>
          <FilterSection label="Estado">
            <MultiSelect
              label="Estado"
              placeholder="Todos los estados"
              options={STATUS_OPTIONS.map((status) => ({
                value: status,
                label: APPLICATION_STATUS_LABEL[status],
              }))}
              selected={filters.statuses ?? []}
              onChange={(statuses) =>
                onChange({ ...filters, statuses: statuses as VacancyApplicationStatus[] })
              }
              className="w-full"
            />
          </FilterSection>

          <FilterSection label="Carrera">
            <MultiSelect
              label="Carrera"
              placeholder="Todas las áreas"
              options={areas.map((area) => ({ value: area.areaId, label: area.name }))}
              selected={filters.areaIds ?? []}
              onChange={(areaIds) => onChange({ ...filters, areaIds })}
              className="w-full"
            />
          </FilterSection>
        </FilterPopoverContent>
      </Popover>
    </div>
  );
}
