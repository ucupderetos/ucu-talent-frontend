"use client";

// Envoltorio "Label + control" para una sección de filtro dentro del popover
// de Filtros (un MultiSelect por sección). Limpiar una sección puntual vive
// DENTRO del propio dropdown del MultiSelect (ver multi-select.tsx) — este
// componente solo agrupa el label con su control.
// Compartido por vacancy-filters.tsx (empresa) y vacancy-feed-filters.tsx
// (alumno) para no repetir el mismo layout en cada uno.

import { Label } from "@/components/ui/label";

/** Link de texto para "Limpiar todo", al pie del popover de Filtros. No un
 *  `Button`: en esa fila, un botón con fondo/borde pesa más de lo que la
 *  acción amerita. */
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
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
