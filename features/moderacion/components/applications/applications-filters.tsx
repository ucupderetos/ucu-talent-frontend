"use client";

// Barra de filtros de "Postulaciones": búsqueda + orden (siempre visibles) +
// un botón único "Filtros" que abre un panel con tres MultiSelect (oferta,
// empresa, estado) — mismo patrón que
// `features/puestos/components/vacancy-filters.tsx` (AGENTS.md, "Barras de
// filtros"). Controlado desde afuera.
//
// Los filtros no se aplican en cada cambio: `filters` es un borrador local
// que solo se busca cuando se presiona "Aplicar filtros". El orden es la
// excepción: se aplica de inmediato, no es un filtro.

import { FilterIcon, SearchIcon } from "lucide-react";

import { ApplyFiltersButton } from "@/components/filters/apply-filters-button";
import { ClearFiltersButton } from "@/components/filters/clear-filters-button";
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
import { MultiSelect } from "@/components/filters/multi-select";
import { APPLICATION_STATUS_LABEL } from "@/features/moderacion/components/applications/application-status-badge";
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
  activeCount,
  onChange,
  onOrderChange,
  onApply,
  onClear,
  canApply,
  canClear,
}: {
  filters: AdminApplicationFilters;
  vacancies: Vacancy[];
  companies: Company[];
  activeCount: number;
  onChange: (filters: AdminApplicationFilters) => void;
  onOrderChange: (order: AdminApplicationOrder) => void;
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
        <PopoverContent align="start" className="flex w-72 flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label>Oferta</Label>
            <MultiSelect
              label="Oferta"
              placeholder="Todas las ofertas"
              options={vacancies.map((v) => ({ value: v.vacancyId, label: v.name }))}
              selected={filters.vacancyIds ?? []}
              onChange={(vacancyIds) => onChange({ ...filters, vacancyIds })}
              className="w-full"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Empresa</Label>
            <MultiSelect
              label="Empresa"
              placeholder="Todas las empresas"
              options={companies.map((c) => ({ value: c.companyId, label: c.name }))}
              selected={filters.companyIds ?? []}
              onChange={(companyIds) => onChange({ ...filters, companyIds })}
              className="w-full"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Estado</Label>
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
