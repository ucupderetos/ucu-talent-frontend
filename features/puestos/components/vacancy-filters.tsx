"use client";

// Barra de filtros de "Mis ofertas": búsqueda + orden (siempre visibles) + un
// botón único "Filtros" que abre un panel con tres MultiSelect (estado, área,
// ubicación) — cada uno con pinta de Select, pero se puede tildar más de una
// opción adentro. Controlado desde afuera (`company-vacancies-view.tsx`) —
// este componente no sabe de dónde vienen los datos, solo emite el filtro
// nuevo.
//
// Los filtros no se aplican en cada cambio: `filters` es un borrador local
// que solo se busca cuando se presiona "Aplicar filtros"
// (`ApplyFiltersButton`, en `components/filters/`). "Limpiar filtros"
// (`ClearFiltersButton`) resetea borrador y búsqueda a la vez.
//
// El orden es la excepción: no es un filtro (AGENTS.md), así que su Select
// usa `onOrderChange` en vez de `onChange` y el padre lo aplica de inmediato,
// sin pasar por "Aplicar filtros".

import { FilterIcon, SearchIcon } from "lucide-react";

import { ApplyFiltersButton } from "@/components/filters/apply-filters-button";
import { ClearFiltersButton } from "@/components/filters/clear-filters-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FilterSection } from "@/features/puestos/components/filter-section";
import { MultiSelect } from "@/features/puestos/components/multi-select";
import { VACANCY_STATUS_LABEL } from "@/features/puestos/components/vacancy-status-badge";
import type { CompanyVacancyFilters, CompanyVacancyOrder } from "@/features/puestos/types";
import type { Area, Department, VacancyStatus } from "@/types";

const ORDER_LABEL: Record<CompanyVacancyOrder, string> = {
  recent: "Más recientes",
  oldest: "Más antiguas",
  applicants: "Más postulantes",
};

export function VacancyFilters({
  filters,
  areas,
  locations,
  activeCount,
  onChange,
  onOrderChange,
  onApply,
  onClear,
  canApply,
  canClear,
}: {
  filters: CompanyVacancyFilters;
  areas: Area[];
  locations: string[];
  /** Cantidad de filtros del popover ya APLICADOS (no del borrador) — la
   *  pasa el padre calculada sobre `appliedFilters`. */
  activeCount: number;
  onChange: (filters: CompanyVacancyFilters) => void;
  onOrderChange: (order: CompanyVacancyOrder) => void;
  onApply: () => void;
  onClear: () => void;
  canApply: boolean;
  canClear: boolean;
}) {
  function clearAll() {
    onChange({ ...filters, statuses: [], areaIds: [], locations: [], page: 1 });
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
          placeholder="Buscar por título o área…"
          className="pl-8"
          aria-label="Buscar ofertas"
        />
      </div>

      <Select
        value={filters.order ?? "recent"}
        onValueChange={(value) => onOrderChange(value as CompanyVacancyOrder)}
      >
        <SelectTrigger aria-label="Ordenar ofertas">
          <SelectValue placeholder="Orden" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(ORDER_LABEL).map(([order, label]) => (
            <SelectItem key={order} value={order}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">
            <FilterIcon />
            Filtros
            {activeCount > 0 && <Badge variant="secondary">{activeCount}</Badge>}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="flex w-72 flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium">Filtros</p>
            {activeCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-muted-foreground"
                onClick={clearAll}
              >
                Limpiar todo
              </Button>
            )}
          </div>

          <FilterSection
            label="Estado"
            hasSelection={(filters.statuses?.length ?? 0) > 0}
            onClear={() => onChange({ ...filters, statuses: [], page: 1 })}
          >
            <MultiSelect
              label="Estado"
              placeholder="Todos los estados"
              options={Object.entries(VACANCY_STATUS_LABEL).map(([value, label]) => ({
                value,
                label,
              }))}
              selected={filters.statuses ?? []}
              onChange={(statuses) => onChange({ ...filters, statuses: statuses as VacancyStatus[] })}
              className="w-full"
            />
          </FilterSection>

          <FilterSection
            label="Área"
            hasSelection={(filters.areaIds?.length ?? 0) > 0}
            onClear={() => onChange({ ...filters, areaIds: [], page: 1 })}
          >
            <MultiSelect
              label="Área"
              placeholder="Todas las áreas"
              options={areas.map((area) => ({ value: area.areaId, label: area.name }))}
              selected={filters.areaIds ?? []}
              onChange={(areaIds) => onChange({ ...filters, areaIds })}
              className="w-full"
            />
          </FilterSection>

          <FilterSection
            label="Ubicación"
            hasSelection={(filters.locations?.length ?? 0) > 0}
            onClear={() => onChange({ ...filters, locations: [], page: 1 })}
          >
            <MultiSelect
              label="Ubicación"
              placeholder="Todas las ubicaciones"
              options={locations.map((location) => ({ value: location, label: location }))}
              selected={filters.locations ?? []}
              onChange={(locations) =>
                onChange({ ...filters, locations: locations as Department[] })
              }
              className="w-full"
            />
          </FilterSection>
        </PopoverContent>
      </Popover>

      <div className="flex flex-wrap items-center gap-2">
        <ApplyFiltersButton onClick={onApply} disabled={!canApply} />
        <ClearFiltersButton onClick={onClear} disabled={!canClear} />
      </div>
    </div>
  );
}
