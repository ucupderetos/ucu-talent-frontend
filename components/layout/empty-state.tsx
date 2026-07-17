// Estado vacío. Los 3 roles tienen listas que arrancan vacías (feed sin puestos,
// sin postulantes, sin nada para moderar) — que todas se vean igual.

import { InboxIcon, type LucideIcon } from "lucide-react";

export function EmptyState({
  titulo,
  descripcion,
  icono: Icono = InboxIcon,
  accion,
}: {
  titulo: string;
  descripcion?: string;
  icono?: LucideIcon;
  accion?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed px-6 py-12 text-center">
      <Icono className="size-8 text-muted-foreground" aria-hidden />
      <p className="mt-4 font-medium">{titulo}</p>
      {descripcion && (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{descripcion}</p>
      )}
      {accion && <div className="mt-4">{accion}</div>}
    </div>
  );
}
