"use client";

// Barra de filtros del feed (vista alumno): búsqueda + carrera (área) + tipo
// de contrato. Controlado desde afuera (vacancy-feed-view.tsx) — este
// componente no sabe de dónde vienen los datos, solo emite el filtro nuevo.

import { SearchIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FeedFilters } from "@/features/puestos/types";
import type { Area } from "@/types";

const ALL = "all";

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
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1 sm:max-w-sm">
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

      <div className="flex flex-wrap gap-2">
        <Select
          value={filters.areaId ?? ALL}
          onValueChange={(value) =>
            onChange({ ...filters, areaId: value === ALL ? undefined : value })
          }
        >
          <SelectTrigger aria-label="Filtrar por carrera">
            <SelectValue placeholder="Por carrera" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todas las áreas</SelectItem>
            {areas.map((area) => (
              <SelectItem key={area.areaId} value={area.areaId}>
                {area.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.contractType ?? ALL}
          onValueChange={(value) =>
            onChange({ ...filters, contractType: value === ALL ? undefined : value })
          }
        >
          <SelectTrigger aria-label="Filtrar por tipo de trabajo">
            <SelectValue placeholder="Por trabajos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos los trabajos</SelectItem>
            {contractTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
