"use client";

// Barra de filtros del feed (vista alumno): búsqueda + un `MultiSelect` por
// filtro (carrera, tipo de contrato) — pinta de Select, pero se puede tildar
// más de una opción. Controlado desde afuera (vacancy-feed-view.tsx) — este
// componente no sabe de dónde vienen los datos, solo emite el filtro nuevo.

import { BriefcaseIcon, GraduationCapIcon, SearchIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { MultiSelect } from "@/features/puestos/components/multi-select";
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

      <MultiSelect
        label="Carrera"
        icon={GraduationCapIcon}
        placeholder="Por carrera"
        options={areas.map((area) => ({ value: area.areaId, label: area.name }))}
        selected={filters.areaIds ?? []}
        onChange={(areaIds) => onChange({ ...filters, areaIds })}
      />

      <MultiSelect
        label="Tipo de trabajo"
        icon={BriefcaseIcon}
        placeholder="Por trabajos"
        options={contractTypes.map((type) => ({ value: type, label: type }))}
        selected={filters.contractTypes ?? []}
        onChange={(contractTypes) => onChange({ ...filters, contractTypes })}
      />
    </div>
  );
}
