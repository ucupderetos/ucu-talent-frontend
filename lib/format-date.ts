// `publicationDate`/`closingDate` (y demás fechas de negocio del wire) llegan
// como `YYYY-MM-DD` — sin hora ni zona. Formatearlas con `new Date(iso)` las
// interpreta como medianoche UTC, y en UTC-3 el resultado puede caer un día
// antes del valor real. Esta función parsea el string directo, sin pasar por
// `Date`, para mostrar exactamente la fecha que devuelve el endpoint.
export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const [year, month, day] = iso.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
}
