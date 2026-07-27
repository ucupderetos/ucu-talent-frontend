"use client";

// buscador + un boton "Filtros" con la industria adentro. Filtrado inmediato:
// cada cambio (search / industria) emite el filtro nuevo por onChange; no hay
// borrador ni "Aplicar". "Limpiar todo" vive DENTRO del popover vía
// `FilterPopoverContent`.

import { FilterIcon, SearchIcon } from "lucide-react";

import { FilterPopoverContent, FilterSection } from "@/components/filters/filter-popover";
import { MultiSelect } from "@/components/filters/multi-select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import type { PendingCompaniesFilters } from "@/features/moderacion/types";

export function PendingCompaniesFiltersBar({
  filters,
  industries,
  onChange,
}: {
  filters: PendingCompaniesFilters;
  industries: string[];
  onChange: (filters: PendingCompaniesFilters) => void;
}) {
  const activeCount = filters.industries?.length ?? 0;

  function clearAll() {
    onChange({ ...filters, industries: [] });
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="relative w-full sm:w-64">
        <SearchIcon
          className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          value={filters.search ?? ""}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          placeholder="Buscar por nombre, industria o email…"
          className="pl-8"
          aria-label="Buscar empresas"
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
          <FilterSection label="Industria">
            <MultiSelect
              label="Industria"
              placeholder="Todas las industrias"
              options={industries.map((industry) => ({ value: industry, label: industry }))}
              selected={filters.industries ?? []}
              onChange={(industries) => onChange({ ...filters, industries })}
              className="w-full"
            />
          </FilterSection>
        </FilterPopoverContent>
      </Popover>
    </div>
  );
}
