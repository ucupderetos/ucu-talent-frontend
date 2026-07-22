"use client";

// Barra de filtros del feed (vista alumno): búsqueda + un botón único
// "Filtros" (carrera + tipo de contrato, multi-selección por checkbox, en un
// popover). Controlado desde afuera (vacancy-feed-view.tsx) — este
// componente no sabe de dónde vienen los datos, solo emite el filtro nuevo.

import { FilterIcon, SearchIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { FeedFilters } from "@/features/puestos/types";
import type { Area } from "@/types";

export function VacancyFeedFilters({
  filters,
  areas,
  contractTypes,
  onChange,
}: {
  filters: FeedFilters;
  areas: Area[];
  contractTypes: string[];
  onChange: (filters: FeedFilters) => void;
}) {
  const activeCount = (filters.areaIds?.length ?? 0) + (filters.contractTypes?.length ?? 0);

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
          placeholder="Buscar entre las vacantes…"
          className="pl-8"
          aria-label="Buscar vacantes"
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
        <PopoverContent align="start" className="w-72">
          <CheckboxFilterGroup
            label="Carrera"
            options={areas.map((area) => ({ value: area.areaId, label: area.name }))}
            selected={filters.areaIds ?? []}
            onChange={(areaIds) => onChange({ ...filters, areaIds })}
          />

          <CheckboxFilterGroup
            label="Tipo de trabajo"
            options={contractTypes.map((type) => ({ value: type, label: type }))}
            selected={filters.contractTypes ?? []}
            onChange={(contractTypes) => onChange({ ...filters, contractTypes })}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

/**
 * Lista de checkboxes para un filtro de multi-selección. Duplica la misma
 * forma que usa `vacancy-filters.tsx` (lado empresa) — no hay todavía un
 * lugar compartido para un helper tan chico entre las dos ramas en curso.
 */
function CheckboxFilterGroup({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (values: string[]) => void;
}) {
  function toggle(value: string, checked: boolean) {
    onChange(checked ? [...selected, value] : selected.filter((v) => v !== value));
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      <div className="flex max-h-48 flex-col gap-2 overflow-y-auto">
        {options.map((option) => (
          <label key={option.value} className="flex items-center gap-2 text-sm font-normal">
            <Checkbox
              checked={selected.includes(option.value)}
              onCheckedChange={(checked) => toggle(option.value, checked === true)}
            />
            {option.label}
          </label>
        ))}
      </div>
    </div>
  );
}
