import { SearchIcon } from "lucide-react";

import { ApplyFiltersButton } from "@/components/filters/apply-filters-button";
import { ClearFiltersButton } from "@/components/filters/clear-filters-button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AdminCompanyFilters } from "@/features/moderacion/types";

type CompaniesFiltersProps = {
  filters: AdminCompanyFilters;
  industries: string[];
  onChange: (filters: AdminCompanyFilters) => void;
  onApply: () => void;
  onClear: () => void;
};

export function CompaniesFilters({
  filters,
  industries,
  onChange,
  onApply,
  onClear,
}: CompaniesFiltersProps) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[minmax(260px,1fr)_220px_240px_auto]">
        <div className="relative">
          <SearchIcon
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />

          <Input
            value={filters.search}
            onChange={(event) =>
              onChange({
                ...filters,
                search: event.target.value,
                page: 1,
              })
            }
            placeholder="Buscar por nombre o correo"
            className="pl-9"
          />
        </div>

        <Select
          value={filters.status}
          onValueChange={(status) =>
            onChange({
              ...filters,
              status: status as AdminCompanyFilters["status"],
              page: 1,
            })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="TODAS">Todos los estados</SelectItem>
            <SelectItem value="APROBADO">Aprobadas</SelectItem>
            <SelectItem value="PENDIENTE">Pendientes</SelectItem>
            <SelectItem value="RECHAZADO">Rechazadas</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.industry}
          onValueChange={(industry) =>
            onChange({
              ...filters,
              industry,
              page: 1,
            })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Industria" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="TODAS">Todas las industrias</SelectItem>

            {industries.map((industry) => (
              <SelectItem key={industry} value={industry}>
                {industry}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex flex-col gap-2 sm:flex-row xl:justify-end">
          <ApplyFiltersButton onClick={onApply} />
          <ClearFiltersButton onClick={onClear} />
        </div>
      </div>
    </div>
  );
}