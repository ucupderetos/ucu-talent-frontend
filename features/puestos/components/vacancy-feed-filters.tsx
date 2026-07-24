"use client";

// Barra de filtros del feed (vista alumno): búsqueda + un botón único
// "Filtros" que abre un panel con dos MultiSelect (carrera, tipo de
// contrato) — cada uno con pinta de Select, pero se puede tildar más de una
// opción adentro. Controlado desde afuera (vacancy-feed-view.tsx) — este
// componente no sabe de dónde vienen los datos, solo emite el filtro nuevo.

import { FilterIcon, SearchIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { ClearLink, FilterSection } from "@/features/puestos/components/filter-section";
import { MultiSelect } from "@/components/filters/multi-select";
import type { FeedFilters } from "@/features/puestos/types";
import type { Area } from "@/types";

export function VacancyFeedFilters({
  filters,
  areas,
  contractTypes,
  onChange,
}: {
  filters: FeedFilters;
  areas: Area[];
  contractTypes: string[];
  onChange: (filters: FeedFilters) => void;
}) {
  const activeCount = (filters.areaIds?.length ?? 0) + (filters.contractTypes?.length ?? 0);

  function clearAll() {
    onChange({ ...filters, areaIds: [], contractTypes: [] });
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
          placeholder="Buscar entre las vacantes…"
          className="pl-8"
          aria-label="Buscar vacantes"
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
        <PopoverContent align="start" className="flex w-72 flex-col gap-3">
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

          <FilterSection label="Tipo de trabajo">
            <MultiSelect
              label="Tipo de trabajo"
              placeholder="Todos los trabajos"
              options={contractTypes.map((type) => ({ value: type, label: type }))}
              selected={filters.contractTypes ?? []}
              onChange={(contractTypes) => onChange({ ...filters, contractTypes })}
              className="w-full"
            />
          </FilterSection>

          {activeCount > 0 && (
            <>
              <Separator />
              <div className="flex justify-center">
                <ClearLink onClick={clearAll}>Limpiar todo</ClearLink>
              </div>
            </>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
