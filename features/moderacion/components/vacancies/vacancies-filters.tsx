"use client";

// Barra de filtros de Ofertas: búsqueda visible + un único popover. Los
// cambios se aplican en vivo y "Limpiar todo" vive dentro del popover vía
// `FilterPopoverContent` (AGENTS.md, "Barras de filtros").

import { FilterIcon, SearchIcon } from "lucide-react";

import { FilterPopoverContent, FilterSection } from "@/components/filters/filter-popover";
import { MultiSelect } from "@/components/filters/multi-select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { VACANCY_STATUS_LABEL } from "@/components/vacancies/vacancy-status-badge";
import { VACANCY_MODALITY_LABEL } from "@/features/moderacion/components/vacancies/vacancy-labels";
import type { AdminVacancyFilters } from "@/features/moderacion/types";
import type { Company, Modality, VacancyStatus } from "@/types";

export function VacanciesFilters({
  filters,
  companies,
  onChange,
}: {
  filters: AdminVacancyFilters;
  companies: Company[];
  onChange: (filters: AdminVacancyFilters) => void;
}) {
  const activeCount =
    (filters.companyIds?.length ?? 0) +
    (filters.statuses?.length ?? 0) +
    (filters.modalities?.length ?? 0);

  function clearAll() {
    onChange({ ...filters, companyIds: [], statuses: [], modalities: [] });
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
          onChange={(event) => onChange({ ...filters, search: event.target.value })}
          placeholder="Buscar por oferta o empresa…"
          className="pl-8"
          aria-label="Buscar ofertas"
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
          <FilterSection label="Empresa">
            <MultiSelect
              label="Empresa"
              placeholder="Todas las empresas"
              options={companies.map((company) => ({
                value: company.companyId,
                label: company.name,
              }))}
              selected={filters.companyIds ?? []}
              onChange={(companyIds) => onChange({ ...filters, companyIds })}
              className="w-full"
            />
          </FilterSection>

          <FilterSection label="Estado">
            <MultiSelect
              label="Estado"
              placeholder="Todos los estados"
              options={Object.entries(VACANCY_STATUS_LABEL).map(([value, label]) => ({
                value,
                label,
              }))}
              selected={filters.statuses ?? []}
              onChange={(statuses) =>
                onChange({ ...filters, statuses: statuses as VacancyStatus[] })
              }
              className="w-full"
            />
          </FilterSection>

          <FilterSection label="Modalidad">
            <MultiSelect
              label="Modalidad"
              placeholder="Todas las modalidades"
              options={Object.entries(VACANCY_MODALITY_LABEL).map(([value, label]) => ({
                value,
                label,
              }))}
              selected={filters.modalities ?? []}
              onChange={(modalities) =>
                onChange({ ...filters, modalities: modalities as Modality[] })
              }
              className="w-full"
            />
          </FilterSection>
        </FilterPopoverContent>
      </Popover>
    </div>
  );
}
