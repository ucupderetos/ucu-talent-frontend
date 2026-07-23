"use client";

// Barra de filtros de "Usuarios": búsqueda (siempre visible, ancho fijo) + un
// botón único "Filtros" que abre un panel con dos MultiSelect (carrera, área)
// — mismo patrón que `features/puestos/components/vacancy-filters.tsx`
// (AGENTS.md, "Barras de filtros"). Controlado desde afuera — este componente
// no sabe de dónde vienen los datos, solo emite el filtro nuevo.
//
// Los filtros no se aplican en cada cambio: `filters` es un borrador local
// que solo se busca cuando se presiona "Aplicar filtros".

import { FilterIcon, SearchIcon } from "lucide-react";

import { ApplyFiltersButton } from "@/components/filters/apply-filters-button";
import { ClearFiltersButton } from "@/components/filters/clear-filters-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MultiSelect } from "@/features/puestos/components/multi-select";
import type { StudentFilters } from "@/features/moderacion/types";
import type { Area, Degree } from "@/types";

export function StudentsFilters({
  filters,
  degrees,
  areas,
  activeCount,
  onChange,
  onApply,
  onClear,
  canApply,
  canClear,
}: {
  filters: StudentFilters;
  degrees: Degree[];
  areas: Area[];
  /** Cantidad de filtros del popover ya APLICADOS (no del borrador). */
  activeCount: number;
  onChange: (filters: StudentFilters) => void;
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
        <PopoverContent align="start" className="flex w-72 flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label>Carrera</Label>
            <MultiSelect
              label="Carrera"
              placeholder="Todas las carreras"
              options={degrees.map((degree) => ({ value: degree.degreeId, label: degree.name }))}
              selected={filters.degreeIds ?? []}
              onChange={(degreeIds) => onChange({ ...filters, degreeIds })}
              className="w-full"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Facultad</Label>
            <MultiSelect
              label="Facultad"
              placeholder="Todas las facultades"
              options={areas.map((area) => ({ value: area.areaId, label: area.name }))}
              selected={filters.areaIds ?? []}
              onChange={(areaIds) => onChange({ ...filters, areaIds })}
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
