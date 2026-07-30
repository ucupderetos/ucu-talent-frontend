"use client";

// Piezas compartidas del popover de "Filtros" (`docs/agents/design-system.md`,
// "Barras de filtros / toolbars"): un `FilterSection` por cada `MultiSelect`, y un pie de
// "Limpiar todo" que aparece solo si hay algo tildado. Vive en
// `components/filters/` (no en `features/<dominio>/`) porque lo usan los
// tres dominios (puestos, postulaciones, moderacion) — importarlo desde
// `features/puestos/` violaría la regla de no cruzar dominios.

import { Label } from "@/components/ui/label";
import { PopoverContent } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

/** Envoltorio "Label + control" para una sección de filtro dentro del
 *  popover. Limpiar una sección puntual vive DENTRO del propio dropdown del
 *  `MultiSelect` (ver `multi-select.tsx`) — este componente solo agrupa el
 *  label con su control. */
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

/**
 * `PopoverContent` estándar del botón "Filtros": envuelve las `FilterSection`
 * pasadas como `children` y agrega "Limpiar todo" al pie (`Separator` +
 * `ClearLink`), visible solo si `activeCount > 0` — mismo criterio en toda la
 * app. Reemplaza el bloque que cada barra de filtros repetía (o, en algunos
 * casos, directamente omitía) a mano.
 */
export function FilterPopoverContent({
  activeCount,
  onClearAll,
  className,
  children,
}: {
  /** Cantidad de filtros del popover con algo tildado (no cuenta búsqueda ni
   *  orden, que no pasan por acá). */
  activeCount: number;
  onClearAll: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <PopoverContent align="start" className={cn("flex w-72 flex-col gap-3", className)}>
      {children}

      {activeCount > 0 && (
        <>
          <Separator />
          <div className="flex justify-center">
            <ClearLink onClick={onClearAll}>Limpiar todo</ClearLink>
          </div>
        </>
      )}
    </PopoverContent>
  );
}
