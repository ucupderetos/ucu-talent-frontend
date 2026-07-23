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
    // Sin variant/color a mano: el default de `Button` ya es `bg-primary`
    // (navy), que es exactamente el énfasis que esta acción necesita dentro
    // de la barra de filtros — repetir el color con `--sidebar` no cambiaba
    // nada visualmente y pisaba un token que no es el suyo (AGENTS.md,
    // "Colores").
    <Button type="button" onClick={onClick} disabled={disabled} className={cn(className)}>
      Aplicar filtros
    </Button>
  );
}
