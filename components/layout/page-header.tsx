// Encabezado de página: título, bajada opcional y slot de acciones.
// Que las 3 secciones lo usen es lo que hace que no parezcan 3 apps distintas.

export function PageHeader({
  titulo,
  descripcion,
  acciones,
}: {
  titulo: string;
  descripcion?: string;
  /** Botones del lado derecho. En mobile bajan abajo del título. */
  acciones?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h1 className="truncate text-2xl font-semibold tracking-tight">{titulo}</h1>
        {descripcion && (
          <p className="mt-1 text-sm text-muted-foreground">{descripcion}</p>
        )}
      </div>
      {acciones && <div className="flex shrink-0 gap-2">{acciones}</div>}
    </div>
  );
}
