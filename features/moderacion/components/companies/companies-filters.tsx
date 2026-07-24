"use client";

// Barra de filtros de "Empresas": búsqueda (siempre visible, ancho fijo) + un
// botón único "Filtros" que abre un panel con dos MultiSelect (estado, rubro)
// — mismo patrón que `students-filters.tsx` y `applications-filters.tsx`
// (AGENTS.md, "Barras de filtros"). Controlado desde afuera.
//
// Los filtros no se aplican en cada cambio: `filters` es un borrador local que
// solo se busca cuando se presiona "Aplicar filtros".

import { FilterIcon, SearchIcon } from "lucide-react";

import { ApplyFiltersButton } from "@/components/filters/apply-filters-button";
import { ClearFiltersButton } from "@/components/filters/clear-filters-button";
import { MultiSelect } from "@/components/filters/multi-select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { COMPANY_STATUS_LABEL } from "@/features/moderacion/components/companies/company-status-badge";
import type { AdminCompanyFilters } from "@/features/moderacion/types";
import type { AccountStatus } from "@/types";

export function CompaniesFilters({
  filters,
  industries,
  activeCount,
  onChange,
  onApply,
  onClear,
  canApply,
  canClear,
}: {
  filters: AdminCompanyFilters;
  industries: string[];
  /** Cantidad de filtros del popover ya APLICADOS (no del borrador). */
  activeCount: number;
  onChange: (filters: AdminCompanyFilters) => void;
  onApply: () => void;
  onClear: () => void;
  canApply: boolean;
  canClear: boolean;
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
          placeholder="Buscar por nombre o correo…"
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
            <Label>Estado</Label>
            <MultiSelect
              label="Estado"
              placeholder="Todos los estados"
              options={Object.entries(COMPANY_STATUS_LABEL).map(([value, label]) => ({
                value,
                label,
              }))}
              selected={filters.statuses ?? []}
              onChange={(statuses) =>
                onChange({ ...filters, statuses: statuses as AccountStatus[] })
              }
              className="w-full"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Rubro / Industria</Label>
            <MultiSelect
              label="Rubro"
              placeholder="Todos los rubros"
              options={industries.map((industry) => ({ value: industry, label: industry }))}
              selected={filters.industries ?? []}
              onChange={(industries) => onChange({ ...filters, industries })}
              className="w-full"
            />
          </div>
        </PopoverContent>
      </Popover>

      <div className="flex flex-wrap items-center gap-2">
        <ApplyFiltersButton onClick={onApply} disabled={!canApply} />
        <ClearFiltersButton onClick={onClear} disabled={!canClear} />
      </div>
    </div>
  );
}
