// Campo de solo lectura de Mi perfil: label arriba, valor abajo. Lo comparten
// la vista del perfil de empresa y la pestaña de información personal del
// alumno — antes había una copia casi idéntica en cada archivo y las dos
// crecieron la misma variante de link.

import { toExternalHref } from "@/lib/urls";

export function ReadOnlyField({
  label,
  value,
  placeholder = "Sin completar",
  isLink = false,
}: {
  label: string;
  value: string | undefined;
  placeholder?: string;
  /** Renderiza el valor como link externo (sitio web, LinkedIn). */
  isLink?: boolean;
}) {
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium">{label}</p>
      {value ? (
        isLink ? (
          // `block truncate`: una URL larga sin espacios no corta sola y se
          // pinta por encima de la columna de al lado del grid (medido: 2283px
          // en una celda de 290px). `truncate` necesita un display de bloque
          // para aplicar — en un `<a>` inline no hace nada. Mismo criterio que
          // `applicant-detail-view.tsx`.
          <a
            href={toExternalHref(value)}
            target="_blank"
            rel="noopener noreferrer"
            title={value}
            className="block truncate text-sm text-primary hover:underline"
          >
            {value}
          </a>
        ) : (
          <p className="text-sm">{value}</p>
        )
      ) : (
        <p className="text-sm text-muted-foreground italic">{placeholder}</p>
      )}
    </div>
  );
}
