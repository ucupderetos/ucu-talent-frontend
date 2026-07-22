"use client";

// Barra de filtros de "Mis ofertas": búsqueda + orden (siempre visibles) + un
// botón único "Filtros" que abre un panel con tres MultiSelect (estado, área,
// ubicación) — cada uno con pinta de Select, pero se puede tildar más de una
// opción adentro. Controlado desde afuera (`company-vacancies-view.tsx`) —
// este componente no sabe de dónde vienen los datos, solo emite el filtro
// nuevo.

import { FilterIcon, SearchIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  onChange,
}: {
  filters: CompanyVacancyFilters;
  areas: Area[];
  locations: string[];
  onChange: (filters: CompanyVacancyFilters) => void;
}) {
  const activeCount =
    (filters.statuses?.length ?? 0) + (filters.areaIds?.length ?? 0) + (filters.locations?.length ?? 0);

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="relative w-full sm:w-64">
        <SearchIcon
          className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          value={filters.search ?? ""}
          onChange={(e) => onChange({ ...filters, search: e.target.value, page: 1 })}
          placeholder="Buscar por título o área…"
          className="pl-8"
          aria-label="Buscar ofertas"
        />
      </div>

      <Select
        value={filters.order ?? "recent"}
        onValueChange={(value) => onChange({ ...filters, order: value as CompanyVacancyOrder })}
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
          <div className="flex flex-col gap-1.5">
            <Label>Estado</Label>
            <MultiSelect
              label="Estado"
              placeholder="Todos los estados"
              options={Object.entries(VACANCY_STATUS_LABEL).map(([value, label]) => ({
                value,
                label,
              }))}
              selected={filters.statuses ?? []}
              onChange={(statuses) =>
                onChange({ ...filters, statuses: statuses as VacancyStatus[], page: 1 })
              }
              className="w-full"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Área</Label>
            <MultiSelect
              label="Área"
              placeholder="Todas las áreas"
              options={areas.map((area) => ({ value: area.areaId, label: area.name }))}
              selected={filters.areaIds ?? []}
              onChange={(areaIds) => onChange({ ...filters, areaIds, page: 1 })}
              className="w-full"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Ubicación</Label>
            <MultiSelect
              label="Ubicación"
              placeholder="Todas las ubicaciones"
              options={locations.map((location) => ({ value: location, label: location }))}
              selected={filters.locations ?? []}
              onChange={(locations) =>
                onChange({ ...filters, locations: locations as Department[], page: 1 })
              }
              className="w-full"
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
