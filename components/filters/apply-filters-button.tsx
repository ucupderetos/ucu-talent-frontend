// Botón genérico de "Aplicar filtros": las barras de filtros (puestos,
// moderación, postulantes…) editan un estado "borrador" en cada input, pero
// recién disparan la búsqueda cuando se presiona este botón. Agnóstico del
// dominio — no sabe qué filtros son ni de dónde vienen, solo expone el
// evento de "aplicar".

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ApplyFiltersButton({
  onClick,
  disabled,
  className,
}: {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <Button
      type="button"
      onClick={onClick}
      disabled={disabled}
      // en vez del `bg-primary` (teal) por default del botón — para que
      // "Aplicar filtros" se distinga como la acción principal de la barra.
      className={cn("bg-sidebar text-sidebar-foreground hover:bg-sidebar-accent", className)}
    >
      Aplicar filtros
    </Button>
  );
}
