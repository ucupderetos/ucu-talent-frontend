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
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { FilterPopoverContent, FilterSection } from "@/components/filters/filter-popover";
import { MultiSelect } from "@/components/filters/multi-select";
import { CONTRACT_TYPE_LABELS } from "@/lib/contract-types";
import type { FeedFilters } from "@/features/puestos/types";
import type { Area, ContractType } from "@/types";

export function VacancyFeedFilters({
  filters,
  areas,
  contractTypes,
  onChange,
}: {
  filters: FeedFilters;
  areas: Area[];
  contractTypes: ContractType[];
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
        <FilterPopoverContent activeCount={activeCount} onClearAll={clearAll}>
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
              options={contractTypes.map((type) => ({
                value: type,
                label: CONTRACT_TYPE_LABELS[type] ?? type,
              }))}
              selected={filters.contractTypes ?? []}
              // `MultiSelect` es genérico en `string[]` (componente compartido,
              // no conoce `ContractType`) — acá es seguro angostar el tipo:
              // las opciones que ofrece salen todas de `contractTypes`
              // (`ContractType[]`), nunca de un valor libre tipeado a mano.
              onChange={(values) => onChange({ ...filters, contractTypes: values as ContractType[] })}
              className="w-full"
            />
          </FilterSection>
        </FilterPopoverContent>
      </Popover>
    </div>
  );
}
