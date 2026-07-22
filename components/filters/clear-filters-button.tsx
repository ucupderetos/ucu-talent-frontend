// Botón genérico de "Limpiar filtros": vuelve la barra de filtros a su
// estado inicial (borrador y aplicado). Mismo criterio que
// `apply-filters-button.tsx` — componente controlado, agnóstico del dominio.

import { XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ClearFiltersButton({
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
      variant="ghost"
      onClick={onClick}
      disabled={disabled}
      className={cn("text-muted-foreground", className)}
    >
      <XIcon />
      Limpiar filtros
    </Button>
  );
}
