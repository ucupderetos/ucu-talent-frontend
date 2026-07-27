"use client";

// Barra de filtros de "Mis ofertas": búsqueda + orden (siempre visibles) + un
// botón único "Filtros" que abre un panel con tres MultiSelect (estado, área,
// ubicación) — cada uno con pinta de Select, pero se puede tildar más de una
// opción adentro — más un rango de fecha de publicación (Desde/Hasta).
// Controlado desde afuera (`company-vacancies-view.tsx`) — este componente no
// sabe de dónde vienen los datos, solo emite el filtro nuevo.
//
// Filtrado inmediato: cada cambio se aplica al toque, sin "Aplicar filtros"
// (mismo criterio que `vacancy-feed-filters.tsx`). "Limpiar todo" vive DENTRO
// del popover de "Filtros", al pie de las secciones.
//
// El orden usa `onOrderChange` en vez de `onChange` porque no es un filtro
// (AGENTS.md) — aunque los dos se apliquen igual de inmediato.

import { FilterIcon, SearchIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FilterPopoverContent, FilterSection } from "@/components/filters/filter-popover";
import { MultiSelect } from "@/components/filters/multi-select";
import { VACANCY_STATUS_LABEL } from "@/components/vacancies/vacancy-status-badge";
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
  onChange,
  onOrderChange,
}: {
  filters: CompanyVacancyFilters;
  areas: Area[];
  locations: string[];
  onChange: (filters: CompanyVacancyFilters) => void;
  onOrderChange: (order: CompanyVacancyOrder) => void;
}) {
  const activeCount =
    (filters.statuses?.length ?? 0) +
    (filters.areaIds?.length ?? 0) +
    (filters.locations?.length ?? 0) +
    (filters.publishedFrom ? 1 : 0) +
    (filters.publishedTo ? 1 : 0);

  function clearAll() {
    onChange({
      ...filters,
      statuses: [],
      areaIds: [],
      locations: [],
      publishedFrom: undefined,
      publishedTo: undefined,
      page: 1,
    });
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
        <FilterPopoverContent activeCount={activeCount} onClearAll={clearAll}>
          <FilterSection label="Estado">
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

          <FilterSection label="Área">
            <MultiSelect
              label="Área"
              placeholder="Todas las áreas"
              options={areas.map((area) => ({ value: area.areaId, label: area.name }))}
              selected={filters.areaIds ?? []}
              onChange={(areaIds) => onChange({ ...filters, areaIds })}
              className="w-full"
            />
          </FilterSection>

          <FilterSection label="Ubicación">
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

          <FilterSection label="Fecha de publicación">
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                value={filters.publishedFrom ?? ""}
                onChange={(e) =>
                  onChange({ ...filters, publishedFrom: e.target.value || undefined })
                }
                max={filters.publishedTo}
                aria-label="Publicadas desde"
              />
              <Input
                type="date"
                value={filters.publishedTo ?? ""}
                onChange={(e) =>
                  onChange({ ...filters, publishedTo: e.target.value || undefined })
                }
                min={filters.publishedFrom}
                aria-label="Publicadas hasta"
              />
            </div>
          </FilterSection>
        </FilterPopoverContent>
      </Popover>
    </div>
  );
}
