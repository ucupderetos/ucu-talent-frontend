"use client";

// Barra de filtros de "Usuarios": búsqueda (siempre visible, ancho fijo) + un
// botón único "Filtros" que abre un panel con tres MultiSelect (estado,
// carrera, área) — mismo patrón que `companies-filters.tsx`
// (`docs/agents/design-system.md`, "Barras de filtros"). Controlado desde afuera — este componente
// no sabe de dónde vienen los datos, solo emite el filtro nuevo.
//
// Filtrado inmediato: cada cambio se aplica al toque, sin "Aplicar filtros".
// "Limpiar todo" vive DENTRO del popover de "Filtros", al pie de las
// secciones.

import { FilterIcon, SearchIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { FilterPopoverContent, FilterSection } from "@/components/filters/filter-popover";
import { MultiSelect } from "@/components/filters/multi-select";
import { ACCOUNT_STATUS_LABEL } from "@/features/moderacion/components/account-status-badge";
import type { StudentFilters } from "@/features/moderacion/types";
import type { AccountStatus, Area, Degree } from "@/types";

export function StudentsFilters({
  filters,
  degrees,
  areas,
  onChange,
}: {
  filters: StudentFilters;
  degrees: Degree[];
  areas: Area[];
  onChange: (filters: StudentFilters) => void;
}) {
  const activeCount =
    (filters.statuses?.length ?? 0) +
    (filters.degreeIds?.length ?? 0) +
    (filters.areaIds?.length ?? 0);

  function clearAll() {
    onChange({ ...filters, statuses: [], degreeIds: [], areaIds: [] });
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
          placeholder="Buscar por nombre, email o cédula…"
          className="pl-8"
          aria-label="Buscar alumnos"
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
              options={Object.entries(ACCOUNT_STATUS_LABEL).map(([value, label]) => ({
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

          <FilterSection label="Carrera">
            <MultiSelect
              label="Carrera"
              placeholder="Todas las carreras"
              options={degrees.map((degree) => ({ value: degree.degreeId, label: degree.name }))}
              selected={filters.degreeIds ?? []}
              onChange={(degreeIds) => onChange({ ...filters, degreeIds })}
              className="w-full"
            />
          </FilterSection>

          <FilterSection label="Facultad">
            <MultiSelect
              label="Facultad"
              placeholder="Todas las facultades"
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
