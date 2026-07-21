"use client";

// los filtros de arriba: buscador, oferta, empresa y estado.
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

interface PostulacionesFiltersProps {
  search: string;
  oferta: string;
  empresa: string;
  estado: string;
  ofertas: string[];
  empresas: string[];
  estados: string[];
  onSearchChange: (value: string) => void;
  onOfertaChange: (value: string) => void;
  onEmpresaChange: (value: string) => void;
  onEstadoChange: (value: string) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
}

export function PostulacionesFilters({
  search,
  oferta,
  empresa,
  estado,
  ofertas,
  empresas,
  estados,
  onSearchChange,
  onOfertaChange,
  onEmpresaChange,
  onEstadoChange,
  onClear,
  hasActiveFilters,
}: PostulacionesFiltersProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="relative flex-1 sm:max-w-xs">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar por nombre, email o puesto..."
          className="pl-8"
        />
      </div>

      <Select value={oferta} onValueChange={onOfertaChange}>
        <SelectTrigger className="w-full sm:w-44">
          <SelectValue placeholder="Oferta" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          {ofertas.map((item) => (
            <SelectItem key={item} value={item}>
              {item}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={empresa} onValueChange={onEmpresaChange}>
        <SelectTrigger className="w-full sm:w-44">
          <SelectValue placeholder="Empresa" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          {empresas.map((item) => (
            <SelectItem key={item} value={item}>
              {item}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={estado} onValueChange={onEstadoChange}>
        <SelectTrigger className="w-full sm:w-44">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          {estados.map((item) => (
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
