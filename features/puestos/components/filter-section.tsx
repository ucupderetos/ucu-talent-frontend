"use client";

// Envoltorio "Label + Limpiar" para una sección de filtro dentro del popover
// de Filtros (un MultiSelect por sección). El link "Limpiar" solo aparece si
// esa sección tiene algo tildado — no agrega ruido a los filtros vacíos.
// Compartido por vacancy-filters.tsx (empresa) y vacancy-feed-filters.tsx
// (alumno) para no repetir el mismo header en cada uno.

import { Label } from "@/components/ui/label";

export function FilterSection({
  label,
  hasSelection,
  onClear,
  children,
}: {
  label: string;
  hasSelection: boolean;
  onClear: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <Label>{label}</Label>
        {hasSelection && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            Limpiar
          </button>
        )}
      </div>
      {children}
    </div>
  );
}
