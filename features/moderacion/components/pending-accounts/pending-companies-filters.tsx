"use client";

// buscador + un boton "Filtros" con la industria adentro. Filtrado inmediato:
// cada cambio (search / industria) emite el filtro nuevo por onChange; no hay
// borrador ni "Aplicar" (mismo criterio que la tab de estudiantes).

import { FilterIcon, SearchIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MultiSelect } from "@/components/filters/multi-select";
import type { PendingCompaniesFilters } from "@/features/moderacion/types";

export function PendingCompaniesFiltersBar({
  filters,
  industries,
  activeCount,
  onChange,
}: {
  filters: PendingCompaniesFilters;
  industries: string[];
  activeCount: number;
  onChange: (filters: PendingCompaniesFilters) => void;
}) {
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
        <PopoverContent align="start" className="flex w-72 flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label>Industria</Label>
            <MultiSelect
              label="Industria"
              placeholder="Todas las industrias"
              options={industries.map((industry) => ({ value: industry, label: industry }))}
              selected={filters.industries ?? []}
              onChange={(industries) => onChange({ ...filters, industries })}
              className="w-full"
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
