// Helpers de fecha de negocio. `publicationDate`/`closingDate` (y demás fechas
// del wire) llegan como `YYYY-MM-DD` — sin hora ni zona. Formatearlas con
// `new Date(iso)` las interpreta como medianoche UTC, y en UTC-3 el resultado
// puede caer un día antes del valor real.

const ISO_DATE_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Montevideo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/**
 * `YYYY-MM-DD` de hoy en Montevideo.
 *
 * ⚠️ La zona es fija a propósito: `VacancyServiceImpl.dateValidation` usa
 * `LocalDate.now(ZoneId.of("America/Montevideo"))`, así que si tomáramos la
 * zona del navegador, un cliente en otro huso podría discrepar con el backend
 * sobre qué día es "hoy" y ver un 400 sin error visible en el form.
 *
 * `en-CA` produce el formato ISO nativamente — no hace falta padding a mano.
 */
export function todayIso(): string {
  return ISO_DATE_FORMATTER.format(new Date());
}

/**
 * `YYYY-MM-DD` → `dd/mm/yyyy`, parseando el string directo (sin pasar por
 * `Date`) para mostrar exactamente la fecha que devuelve el endpoint.
 * Acepta también un ISO con hora: se queda con los primeros 10 caracteres.
 */
export function formatDate(iso: string | null, emptyLabel = "—"): string {
  if (!iso || !/^\d{4}-\d{2}-\d{2}/.test(iso)) return emptyLabel;
  const [year, month, day] = iso.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
}

/**
 * `iso` + 1 año, replicando el clamp de `LocalDate.plusYears(1)` de Java: si
 * el día no existe en el mes destino cae al último día del mes (el único caso
 * real es `2028-02-29` → `2029-02-28`). Se usa para replicar la regla del
 * backend "el cierre no puede superar un año desde la publicación".
 */
export function plusOneYearIso(iso: string): string {
  const [year, month, day] = iso.slice(0, 10).split("-").map(Number);
  // Día 0 del mes siguiente = último día del mes buscado.
  const lastDayOfMonth = new Date(year + 1, month, 0).getDate();
  const clampedDay = Math.min(day, lastDayOfMonth);
  return `${year + 1}-${String(month).padStart(2, "0")}-${String(clampedDay).padStart(2, "0")}`;
}
