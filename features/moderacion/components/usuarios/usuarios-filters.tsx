"use client";

// los filtros de arriba: buscador, carrera y facultad.
// recibe los valores por props y avisa cuando cambian.

import { SearchIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UsuariosFiltersProps {
  search: string;
  degree: string;
  area: string;
  degrees: string[];
  areas: string[];
  onSearchChange: (value: string) => void;
  onDegreeChange: (value: string) => void;
  onAreaChange: (value: string) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
}

export function UsuariosFilters({
  search,
  degree,
  area,
  degrees,
  areas,
  onSearchChange,
  onDegreeChange,
  onAreaChange,
  onClear,
  hasActiveFilters,
}: UsuariosFiltersProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="relative flex-1 sm:max-w-xs">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar por nombre, email o cédula..."
          className="pl-8"
        />
      </div>

      <Select value={degree} onValueChange={onDegreeChange}>
        <SelectTrigger className="w-full sm:w-44">
          <SelectValue placeholder="Carrera" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          {degrees.map((item) => (
            <SelectItem key={item} value={item}>
              {item}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={area} onValueChange={onAreaChange}>
        <SelectTrigger className="w-full sm:w-44">
          <SelectValue placeholder="Facultad" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          {areas.map((item) => (
            <SelectItem key={item} value={item}>
              {item}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button variant="ghost" onClick={onClear} disabled={!hasActiveFilters}>
        Limpiar filtros
      </Button>
    </div>
  );
}
