// Encabezado de página: slot de acciones (y, en la firma, título/bajada
// opcionales que hoy NADIE pasa). Que las 3 secciones lo usen es lo que hace
// que no parezcan 3 apps distintas.
//
// `title`/`description` no se usan: el Navbar es quien muestra el nombre de
// la sección (ver "Header dinámico + breadcrumb" en AGENTS.md) — repetirlo acá
// sería redundante. No es una elección por pantalla: ninguna pantalla los
// pasa. Quedan tipados por si en el futuro aparece una página fuera de las
// secciones del Sidebar que sí necesite un título propio.

export function PageHeader({
  title,
  description,
  actions,
}: {
  title?: string;
  description?: string;
  /** Botones del lado derecho. En mobile bajan abajo del título. */
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        {title && <h1 className="truncate text-2xl font-semibold tracking-tight">{title}</h1>}
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
    </div>
  );
}
