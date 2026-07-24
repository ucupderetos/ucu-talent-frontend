"use client";

// Barra de filtros de Ofertas: búsqueda visible + un único popover. Los
// cambios se aplican en vivo y "Limpiar todo" vive dentro del popover, tal
// como define AGENTS.md.

import { FilterIcon, SearchIcon } from "lucide-react";

import { MultiSelect } from "@/components/filters/multi-select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
  VACANCY_MODALITY_LABEL,
  VACANCY_STATUS_LABEL,
} from "@/features/moderacion/components/vacancies/vacancy-labels";
import type { AdminVacancyFilters } from "@/features/moderacion/types";
import type { Company, Modality, VacancyStatus } from "@/types";

export function VacanciesFilters({
  filters,
  companies,
  activeCount,
  onChange,
  onClearFilters,
}: {
  filters: AdminVacancyFilters;
  companies: Company[];
  /** Cantidad de filtros del popover ya aplicados. */
  activeCount: number;
  onChange: (filters: AdminVacancyFilters) => void;
  onClearFilters: () => void;
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
        <PopoverContent align="start" className="flex w-72 flex-col gap-3">
          <p className="text-sm font-medium">Filtros</p>

          <div className="flex flex-col gap-1.5">
            <Label>Empresa</Label>
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
          </div>

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
                onChange({ ...filters, statuses: statuses as VacancyStatus[] })
              }
              className="w-full"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Modalidad</Label>
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
          </div>

          {activeCount > 0 && (
            <>
              <Separator />
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={onClearFilters}
                  className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                >
                  Limpiar todo
                </button>
              </div>
            </>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
