"use client";

// Barra de filtros de "Postulantes": búsqueda + orden (siempre visibles) + un
// botón único "Filtros" que abre un panel con multi-selects de estado y oferta.
// La tabla arranca sin estado aplicado, así trae todos los postulantes.

import { FilterIcon, SearchIcon } from "lucide-react";

import { MultiSelect } from "@/components/filters/multi-select";
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
import type { VacancyApplicationStatus } from "@/types";
import type { ApplicantFilters, ApplicantOrder } from "@/features/postulaciones/types";

const ORDER_LABEL: Record<ApplicantOrder, string> = {
  recent: "Más recientes",
  oldest: "Más antiguas",
};

const STATUS_OPTIONS: { value: VacancyApplicationStatus; label: string }[] = [
  { value: "PENDIENTE", label: "Nuevos" },
  { value: "VISTO", label: "En revisión" },
  { value: "FINALIZADO", label: "Finalizados" },
];

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
        <PopoverContent align="start" className="flex w-72 flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label>Estado</Label>
            <MultiSelect
              label="Estado"
              placeholder="Todos los estados"
              options={STATUS_OPTIONS}
              selected={filters.statuses ?? []}
              onChange={(statuses) =>
                onChange({ ...filters, statuses: statuses as VacancyApplicationStatus[], page: 1 })
              }
              className="w-full"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Oferta</Label>
            <MultiSelect
              label="Oferta"
              placeholder="Todas las ofertas"
              options={vacancyOptions}
              selected={filters.vacancyIds ?? []}
              onChange={(vacancyIds) => onChange({ ...filters, vacancyIds, page: 1 })}
              className="w-full"
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
