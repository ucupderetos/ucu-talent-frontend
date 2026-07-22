"use client";

// Select con pinta de shadcn (`SelectTrigger`) pero multi-selección — Radix
// `Select` no la soporta, así que esto es un combobox (`Popover` + `Command`)
// que se ve y se comporta como un select. El trigger resume la selección
// ("2 seleccionadas") en vez de mostrar todas las opciones tildadas.
//
// Usado por los filtros de `puestos` (feed y "Mis ofertas"). Si otro dominio
// necesita lo mismo, este es candidato a subir a `components/ui/`.

import { ChevronDownIcon, type LucideIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface MultiSelectOption {
  value: string;
  label: string;
}

export function MultiSelect({
  label,
  icon: Icon,
  placeholder,
  options,
  selected,
  onChange,
  className,
}: {
  /** Usado como `aria-label` del trigger ("Filtrar por carrera"). */
  label: string;
  icon?: LucideIcon;
  placeholder: string;
  options: MultiSelectOption[];
  selected: string[];
  onChange: (values: string[]) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  const summary =
    selected.length === 0
      ? placeholder
      : selected.length === 1
        ? (options.find((option) => option.value === selected[0])?.label ?? placeholder)
        : `${selected.length} seleccionadas`;

  function toggle(value: string) {
    onChange(
      selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value],
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label={`Filtrar por ${label.toLowerCase()}`}
          className={cn("w-full justify-between font-normal sm:w-auto", className)}
        >
          <span className="flex min-w-0 items-center gap-1.5">
            {Icon && <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />}
            <span className="truncate">{summary}</span>
          </span>
          <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 p-0">
        <Command disablePointerSelection>
          <CommandList>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={() => toggle(option.value)}
                  className="data-selected:bg-transparent data-selected:text-foreground"
                >
                  <Checkbox checked={selected.includes(option.value)} className="pointer-events-none" />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>

            {selected.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => onChange([])}
                    className="justify-center text-muted-foreground data-selected:bg-transparent data-selected:text-foreground"
                  >
                    Limpiar
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
