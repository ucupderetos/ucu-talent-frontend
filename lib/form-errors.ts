import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

/**
 * Mapea el mapa de errores por campo del backend (`ApiError.fieldErrors`,
 * A-19: `{ campo: mensaje }`, ver `lib/api-client.ts` y `docs/agents/open-questions.md`) a los
 * errores de un formulario de React Hook Form, para que cada mensaje se vea
 * pegado a su control en vez de solo en un toast/banner genérico.
 *
 * Solo aplica los campos que el form declara conocer (`knownFields`). Un campo
 * que el backend devuelve pero el form no tiene —o que no se puede pegar a un
 * único control (ej. `salary` cuando en la UI está partido en moneda/mínimo/
 * máximo)— NO se descarta en silencio: su mensaje se junta en `unmapped`, para
 * que el llamador lo muestre donde tenga sentido (un `setError("root", ...)` al
 * pie, un banner, etc.). Así ningún mensaje del backend se pierde.
 *
 * Es una función pura: los tipos de RHF son solo tipos (no runtime de React),
 * así que vive en `lib/`. La lógica de a qué paso o campo navegar cuando el
 * error cae fuera de la vista actual queda en cada form —es quien la conoce—,
 * y se decide con el `applied` que devuelve.
 */
export function applyFieldErrors<T extends FieldValues>(
  fieldErrors: Record<string, string>,
  setError: UseFormSetError<T>,
  knownFields: ReadonlySet<string>,
): { applied: string[]; unmapped: string[] } {
  const applied: string[] = [];
  const unmapped: string[] = [];

  for (const [field, message] of Object.entries(fieldErrors)) {
    if (knownFields.has(field)) {
      setError(field as Path<T>, { type: "server", message });
      applied.push(field);
    } else {
      unmapped.push(message);
    }
  }

  return { applied, unmapped };
}
