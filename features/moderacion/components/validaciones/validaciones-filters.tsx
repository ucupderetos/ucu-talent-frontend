"use client";

//buscador, tipo, categoria y solicitado por.
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

interface ValidacionesFiltersProps {
  search: string;
  categoria: string;
  solicitadoPor: string;
  categorias: string[];
  solicitantes: string[];
  onSearchChange: (value: string) => void;
  onCategoriaChange: (value: string) => void;
  onSolicitadoPorChange: (value: string) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
}

export function ValidacionesFilters({
  search,
  categoria,
  solicitadoPor,
  categorias,
  solicitantes,
  onSearchChange,
  onCategoriaChange,
  onSolicitadoPorChange,
  onClear,
  hasActiveFilters,
}: ValidacionesFiltersProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="relative flex-1 sm:max-w-xs">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar por nombre, titulo o email..."
          className="pl-8"
        />
      </div>

      <Select value={categoria} onValueChange={onCategoriaChange}>
        <SelectTrigger className="w-full sm:w-44">
          <SelectValue placeholder="Categoría" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          {categorias.map((item) => (
            <SelectItem key={item} value={item}>
              {item}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={solicitadoPor} onValueChange={onSolicitadoPorChange}>
        <SelectTrigger className="w-full sm:w-44">
          <SelectValue placeholder="Solicitado por" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          {solicitantes.map((item) => (
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
