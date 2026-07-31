// El backend serializa LocalDate y LocalDateTime sin offset. Las fechas de
// calendario no se pueden pasar directo a `new Date("YYYY-MM-DD")` porque se
// interpretarían como UTC; los datetimes se generan en America/Montevideo.

const MONTEVIDEO_OFFSET = "-03:00";

export function parseCalendarDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return null;

  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));

  return Number.isNaN(date.getTime()) ? null : date;
}

export function parseMontevideoDateTime(value: string): Date | null {
  // Java puede enviar microsegundos; Date usa milisegundos. Recortar también
  // evita diferencias de parseo entre navegadores.
  const milliseconds = value.replace(/\.(\d{3})\d+$/, ".$1");
  const hasOffset = /(?:Z|[+-]\d{2}:\d{2})$/.test(milliseconds);
  const date = new Date(hasOffset ? milliseconds : `${milliseconds}${MONTEVIDEO_OFFSET}`);

  return Number.isNaN(date.getTime()) ? null : date;
}
