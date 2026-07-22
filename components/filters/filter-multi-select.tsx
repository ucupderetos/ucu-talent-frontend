"use client";

// Selector múltiple genérico para barras de filtros: un botón con dropdown de
// checkboxes que permite combinar varias opciones en un mismo filtro (ej.
// Estado = PUBLICADO + FINALIZADO a la vez). Controlado desde afuera, como
// los `Select` de shadcn — no sabe de dónde vienen las opciones ni a dónde va
// el valor.

import { ChevronDownIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface FilterMultiSelectOption<T extends string> {
  value: T;
  label: string;
}

export function FilterMultiSelect<T extends string>({
  label,
  options,
  selected,
  onChange,
  ariaLabel,
  className,
}: {
  label: string;
  options: FilterMultiSelectOption<T>[];
  selected: T[];
  onChange: (values: T[]) => void;
  ariaLabel?: string;
  className?: string;
}) {
  function toggle(value: T) {
    onChange(
      selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value],
    );
  }

  return (
    // `modal={false}`: por default Radix bloquea los clicks de "afuera" del
    // menú mientras está abierto (los usa solo para cerrarlo). Como este
    // dropdown se suele dejar abierto y clickear directo "Aplicar filtros",
    // ese modo hacía que el primer click cerrara el menú sin llegarle al
    // botón — quedaba pareciendo que hacían falta dos clicks para aplicar.
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" aria-label={ariaLabel ?? label} className={cn("font-normal", className)}>
          {label}
          {selected.length > 0 && (
            <Badge variant="secondary" className="rounded-full px-1.5">
              {selected.length}
            </Badge>
          )}
          <ChevronDownIcon className="text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-48">
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onSelect={(event) => {
              event.preventDefault();
              toggle(option.value);
            }}
          >
            <Checkbox
              checked={selected.includes(option.value)}
              tabIndex={-1}
              aria-hidden
              className="pointer-events-none"
            />
            {option.label}
          </DropdownMenuItem>
        ))}

        {selected.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="justify-center text-muted-foreground"
              onSelect={() => onChange([])}
            >
              Limpiar selección
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
