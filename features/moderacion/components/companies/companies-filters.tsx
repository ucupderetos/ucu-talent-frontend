"use client";

// Barra de filtros de "Empresas": búsqueda (siempre visible, ancho fijo) + un
// botón único "Filtros" que abre un panel con tres MultiSelect (estado,
// rubro, ubicación) — mismo patrón que `students-filters.tsx` y
// `applications-filters.tsx` (AGENTS.md, "Barras de filtros"). Controlado
// desde afuera.
//
// Filtrado inmediato: cada cambio se aplica al toque, sin "Aplicar filtros".
// "Limpiar todo" vive DENTRO del popover de "Filtros", al pie de las
// secciones.

import { FilterIcon, SearchIcon } from "lucide-react";

import { FilterPopoverContent, FilterSection } from "@/components/filters/filter-popover";
import { MultiSelect } from "@/components/filters/multi-select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { COMPANY_STATUS_LABEL } from "@/features/moderacion/components/companies/company-status-badge";
import type { AdminCompanyFilters } from "@/features/moderacion/types";
import type { AccountStatus } from "@/types";

export function CompaniesFilters({
  filters,
  industries,
  locations,
  onChange,
}: {
  filters: AdminCompanyFilters;
  industries: string[];
  locations: string[];
  onChange: (filters: AdminCompanyFilters) => void;
}) {
  const activeCount =
    (filters.statuses?.length ?? 0) +
    (filters.industries?.length ?? 0) +
    (filters.locations?.length ?? 0);

  function clearAll() {
    onChange({ ...filters, statuses: [], industries: [], locations: [] });
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
        <FilterPopoverContent activeCount={activeCount} onClearAll={clearAll}>
          <FilterSection label="Estado">
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
          </FilterSection>

          <FilterSection label="Rubro / Industria">
            <MultiSelect
              label="Rubro"
              placeholder="Todos los rubros"
              options={industries.map((industry) => ({ value: industry, label: industry }))}
              selected={filters.industries ?? []}
              onChange={(industries) => onChange({ ...filters, industries })}
              className="w-full"
            />
          </FilterSection>

          <FilterSection label="Ubicación">
            <MultiSelect
              label="Ubicación"
              placeholder="Todas las ubicaciones"
              options={locations.map((location) => ({ value: location, label: location }))}
              selected={filters.locations ?? []}
              onChange={(locations) => onChange({ ...filters, locations })}
              className="w-full"
            />
          </FilterSection>
        </FilterPopoverContent>
      </Popover>
    </div>
  );
}
