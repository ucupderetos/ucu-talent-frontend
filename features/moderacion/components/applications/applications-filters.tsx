"use client";

// Barra de filtros de "Postulaciones": búsqueda + orden (siempre visibles) +
// un botón único "Filtros" que abre un panel con tres MultiSelect (oferta,
// empresa, estado) — mismo patrón que
// `features/puestos/components/vacancy-filters.tsx` (AGENTS.md, "Barras de
// filtros"). Controlado desde afuera.
//
// Filtrado inmediato: cada cambio se aplica al toque, sin "Aplicar filtros".
// "Limpiar todo" vive DENTRO del popover de "Filtros", al pie de las
// secciones. El orden usa `onOrderChange` en vez de `onChange` porque no es
// un filtro (AGENTS.md) — aunque los dos se apliquen igual de inmediato.

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
import { APPLICATION_STATUS_LABEL } from "@/components/vacancies/application-status-badge";
import type { AdminApplicationFilters, AdminApplicationOrder } from "@/features/moderacion/types";
import type { Company, Vacancy, VacancyApplicationStatus } from "@/types";

const ORDER_LABEL: Record<AdminApplicationOrder, string> = {
  recent: "Más recientes",
  oldest: "Más antiguas",
};

export function ApplicationsFilters({
  filters,
  vacancies,
  companies,
  onChange,
  onOrderChange,
}: {
  filters: AdminApplicationFilters;
  vacancies: Vacancy[];
  companies: Company[];
  onChange: (filters: AdminApplicationFilters) => void;
  onOrderChange: (order: AdminApplicationOrder) => void;
}) {
  const activeCount =
    (filters.vacancyIds?.length ?? 0) +
    (filters.companyIds?.length ?? 0) +
    (filters.statuses?.length ?? 0);

  function clearAll() {
    onChange({ ...filters, vacancyIds: [], companyIds: [], statuses: [] });
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
          placeholder="Buscar por nombre, email o puesto…"
          className="pl-8"
          aria-label="Buscar postulaciones"
        />
      </div>

      <Select
        value={filters.order ?? "recent"}
        onValueChange={(value) => onOrderChange(value as AdminApplicationOrder)}
      >
        <SelectTrigger aria-label="Ordenar postulaciones">
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
          <FilterSection label="Oferta">
            <MultiSelect
              label="Oferta"
              placeholder="Todas las ofertas"
              options={vacancies.map((v) => ({ value: v.vacancyId, label: v.name }))}
              selected={filters.vacancyIds ?? []}
              onChange={(vacancyIds) => onChange({ ...filters, vacancyIds })}
              className="w-full"
            />
          </FilterSection>

          <FilterSection label="Empresa">
            <MultiSelect
              label="Empresa"
              placeholder="Todas las empresas"
              options={companies.map((c) => ({ value: c.companyId, label: c.name }))}
              selected={filters.companyIds ?? []}
              onChange={(companyIds) => onChange({ ...filters, companyIds })}
              className="w-full"
            />
          </FilterSection>

          <FilterSection label="Estado">
            <MultiSelect
              label="Estado"
              placeholder="Todos los estados"
              options={Object.entries(APPLICATION_STATUS_LABEL).map(([value, label]) => ({
                value,
                label,
              }))}
              selected={filters.statuses ?? []}
              onChange={(statuses) =>
                onChange({ ...filters, statuses: statuses as VacancyApplicationStatus[] })
              }
              className="w-full"
            />
          </FilterSection>
        </FilterPopoverContent>
      </Popover>
    </div>
  );
}
