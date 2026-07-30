// Utilidades compartidas para el campo `salary` (`Vacancy.salary`, un único
// `string` en el wire). Se usan tanto en la creación (`use-create-job-form.tsx`
// / `job-details-form.tsx`) como en la edición (`edit-job-form.tsx`) de una
// oferta, para que las dos pantallas ofrezcan la misma UI de 2 modos:
// "estructurado" (moneda + monto desde + monto hasta) y "texto libre" (para
// valores no numéricos como "A convenir" que el modo estructurado no puede
// representar sin perder información).
//
// No hay enum de moneda confirmado en docs/ENDPOINTS.md: se fija una lista
// chica de uso real (UYU/USD) para el modo estructurado.
export const SALARY_CURRENCIES = ["UYU", "USD"] as const;
export type SalaryCurrency = (typeof SALARY_CURRENCIES)[number];

export const SALARY_MODES = ["structured", "free"] as const;
export type SalaryMode = (typeof SALARY_MODES)[number];

export const SALARY_AMOUNT_PATTERN = /^\d+([.,]\d+)?$/;

/** Arma el string del wire a partir de moneda + rango. Sin "hasta" (o
 *  igual al "desde") queda un monto fijo, "MONEDA monto" (ej. "USD 700").
 *  Con "hasta", el formato pasa a ser "MONEDAdesde-hasta" pegado, sin
 *  espacios (ej. "USD700-900") — pedido explícito de negocio, no el mismo
 *  formato que el monto fijo. */
export function formatSalary(currency: SalaryCurrency, min: string, max: string): string {
  const cleanMin = min.trim();
  const cleanMax = max.trim();
  if (!cleanMax || cleanMax === cleanMin) return `${currency} ${cleanMin}`;
  return `${currency}${cleanMin}-${cleanMax}`;
}

/**
 * Lee un `salary` existente para precargar los controles. El wire real usa
 * "MONEDA monto" para un monto fijo o "MONEDAdesde-hasta" pegado para un
 * rango (ver formatSalary), pero hay puestos viejos con texto libre ("A
 * convenir", "$35.000 - $45.000" con `$` en vez de un código ISO, o el
 * formato anterior "MONEDA desde - hasta" con espacios) — para esos, `min`
 * queda vacío (no se pudo rescatar ningún número), y ESE es justo el
 * criterio que usan los forms para arrancar en modo "texto libre" en vez
 * de "estructurado": mejor mostrar el texto original tal cual que forzarlo a
 * 3 campos numéricos y perder la información.
 *
 * El regex de moneda no exige `\b` al final: con el formato pegado
 * ("USD700") no hay borde de palabra entre la "D" y el "7" (los dos son
 * `\w`), así que un `\b` ahí nunca matchearía.
 */
export function parseSalary(raw: string): { currency: SalaryCurrency; min: string; max: string } {
  const currencyMatch = raw.match(/\b(UYU|USD)/i);
  const currency = (currencyMatch?.[1]?.toUpperCase() ?? "UYU") as SalaryCurrency;
  const [min = "", max = ""] = raw.match(/\d+(?:[.,]\d+)*/g) ?? [];
  return {
    currency: SALARY_CURRENCIES.includes(currency) ? currency : "UYU",
    min,
    max: max === min ? "" : max,
  };
}
