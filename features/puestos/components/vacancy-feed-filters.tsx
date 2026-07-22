"use client";

// Barra de filtros del feed (vista alumno): búsqueda + un botón único
// "Filtros" (carrera + tipo de contrato, en un popover). Controlado desde
// afuera (vacancy-feed-view.tsx) — este componente no sabe de dónde vienen
// los datos, solo emite el filtro nuevo.

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
  const activeCount = [filters.areaId, filters.contractType].filter(Boolean).length;

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
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="feed-filter-area">Carrera</Label>
            <Select
              value={filters.areaId ?? ALL}
              onValueChange={(value) =>
                onChange({ ...filters, areaId: value === ALL ? undefined : value })
              }
            >
              <SelectTrigger id="feed-filter-area" className="w-full">
                <SelectValue placeholder="Todas las áreas" />
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
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="feed-filter-contract-type">Tipo de trabajo</Label>
            <Select
              value={filters.contractType ?? ALL}
              onValueChange={(value) =>
                onChange({ ...filters, contractType: value === ALL ? undefined : value })
              }
            >
              <SelectTrigger id="feed-filter-contract-type" className="w-full">
                <SelectValue placeholder="Todos los trabajos" />
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
        </PopoverContent>
      </Popover>
    </div>
  );
}
