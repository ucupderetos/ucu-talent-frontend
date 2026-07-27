"use client";

// Barra de filtros de "Postulantes": búsqueda + orden (siempre visibles) + un
// botón único "Filtros" que abre un panel con multi-selects de estado y oferta.
// La tabla arranca sin estado aplicado, así trae todos los postulantes.
// "Limpiar todo" vive DENTRO del popover vía `FilterPopoverContent`.

import { FilterIcon, SearchIcon } from "lucide-react";

import { FilterPopoverContent, FilterSection } from "@/components/filters/filter-popover";
import { MultiSelect } from "@/components/filters/multi-select";
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
import { APPLICANT_STATUS_LABEL } from "@/features/postulaciones/components/applicant-status-badge";
import type { VacancyApplicationStatus } from "@/types";
import type { ApplicantFilters, ApplicantOrder } from "@/features/postulaciones/types";

const ORDER_LABEL: Record<ApplicantOrder, string> = {
  recent: "Más recientes",
  oldest: "Más antiguas",
};

export function ApplicantFiltersBar({
  filters,
  vacancyOptions,
  onChange,
}: {
  filters: ApplicantFilters;
  vacancyOptions: { value: string; label: string }[];
  onChange: (filters: ApplicantFilters) => void;
}) {
  const activeCount = (filters.statuses?.length ?? 0) + (filters.vacancyIds?.length ?? 0);

  function clearAll() {
    onChange({ ...filters, statuses: [], vacancyIds: [], page: 1 });
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
          onChange={(e) => onChange({ ...filters, search: e.target.value, page: 1 })}
          placeholder="Buscar por nombre o email…"
          className="pl-8"
          aria-label="Buscar postulantes"
        />
      </div>

      <Select
        value={filters.order ?? "recent"}
        onValueChange={(value) => onChange({ ...filters, order: value as ApplicantOrder, page: 1 })}
      >
        <SelectTrigger aria-label="Ordenar postulantes">
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
              options={Object.entries(APPLICANT_STATUS_LABEL).map(([value, label]) => ({
                value,
                label,
              }))}
              selected={filters.statuses ?? []}
              onChange={(statuses) =>
                onChange({ ...filters, statuses: statuses as VacancyApplicationStatus[], page: 1 })
              }
              className="w-full"
            />
          </FilterSection>

          <FilterSection label="Oferta">
            <MultiSelect
              label="Oferta"
              placeholder="Todas las ofertas"
              options={vacancyOptions}
              selected={filters.vacancyIds ?? []}
              onChange={(vacancyIds) => onChange({ ...filters, vacancyIds, page: 1 })}
              className="w-full"
            />
          </FilterSection>
        </FilterPopoverContent>
      </Popover>
    </div>
  );
}
