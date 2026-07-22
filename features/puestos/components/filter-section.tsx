"use client";

// Envoltorio "Label + Limpiar" para una sección de filtro dentro del popover
// de Filtros (un MultiSelect por sección). El link "Limpiar" solo aparece si
// esa sección tiene algo tildado — no agrega ruido a los filtros vacíos.
// Compartido por vacancy-filters.tsx (empresa) y vacancy-feed-filters.tsx
// (alumno) para no repetir el mismo header en cada uno.

import { Label } from "@/components/ui/label";

/**
 * Mismo link de texto para los dos niveles de "limpiar" (por sección y
 * "Limpiar todo") — son la misma acción a distinta escala, así que se ven
 * igual. No un `Button`: al lado del `Label` de una sección, un botón con
 * fondo/borde pesa demasiado para una acción secundaria.
 */
export function ClearLink({
  onClick,
  children = "Limpiar",
}: {
  onClick: () => void;
  children?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
    >
      {children}
    </button>
  );
}

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
        {hasSelection && <ClearLink onClick={onClear} />}
      </div>
      {children}
    </div>
  );
}
