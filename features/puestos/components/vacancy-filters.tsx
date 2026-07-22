"use client";

// Barra de filtros de "Mis ofertas": búsqueda + estado + área + ubicación +
// orden. Controlado desde afuera (`company-vacancies-view.tsx`) — este
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
import { VACANCY_STATUS_LABEL } from "@/features/puestos/components/vacancy-status-badge";
import type { CompanyVacancyFilters, CompanyVacancyOrder } from "@/features/puestos/types";
import type { Area, Department, VacancyStatus } from "@/types";

const ALL = "all";

const ORDER_LABEL: Record<CompanyVacancyOrder, string> = {
  recent: "Más recientes",
  oldest: "Más antiguas",
  applicants: "Más postulantes",
};

export function VacancyFilters({
  filters,
  areas,
  locations,
  onChange,
}: {
  filters: CompanyVacancyFilters;
  areas: Area[];
  locations: string[];
  onChange: (filters: CompanyVacancyFilters) => void;
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
          onChange={(e) => onChange({ ...filters, search: e.target.value, page: 1 })}
          placeholder="Buscar por título o área…"
          className="pl-8"
          aria-label="Buscar ofertas"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Select
          value={filters.status ?? ALL}
          onValueChange={(value) =>
            onChange({
              ...filters,
              status: value === ALL ? undefined : (value as VacancyStatus),
              page: 1,
            })
          }
        >
          <SelectTrigger aria-label="Filtrar por estado">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos los estados</SelectItem>
            {Object.entries(VACANCY_STATUS_LABEL).map(([status, label]) => (
              <SelectItem key={status} value={status}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.areaId ?? ALL}
          onValueChange={(value) =>
            onChange({ ...filters, areaId: value === ALL ? undefined : value, page: 1 })
          }
        >
          <SelectTrigger aria-label="Filtrar por área">
            <SelectValue placeholder="Área" />
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
          value={filters.location ?? ALL}
          onValueChange={(value) =>
            onChange({
              ...filters,
              location: value === ALL ? undefined : (value as Department),
              page: 1,
            })
          }
        >
          <SelectTrigger aria-label="Filtrar por ubicación">
            <SelectValue placeholder="Ubicación" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todas las ubicaciones</SelectItem>
            {locations.map((location) => (
              <SelectItem key={location} value={location}>
                {location}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.order ?? "recent"}
          onValueChange={(value) => onChange({ ...filters, order: value as CompanyVacancyOrder })}
        >
          <SelectTrigger aria-label="Ordenar ofertas">
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
      </div>
    </div>
  );
}
