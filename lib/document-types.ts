// Diccionario de presentación de `common.DocumentType`. Mismo patrón que
// lib/contract-types.ts / lib/modality.ts. Unifica las variantes que antes
// divergían por pantalla ("Cédula de identidad" / "…Identidad" / "C.I."):
// un solo label por valor, consumido por el registro, el perfil y las tablas
// de moderación.

import type { DocumentType } from "@/types";

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  CEDULA_IDENTIDAD: "Cédula de identidad",
  PASAPORTE: "Pasaporte",
  DNI: "DNI",
};

// Tupla `readonly` para servir tanto a `.map()` en la UI como a `z.enum()`.
export const DOCUMENT_TYPES = [
  "CEDULA_IDENTIDAD",
  "PASAPORTE",
  "DNI",
] as const satisfies readonly DocumentType[];

/** Forma `{value, label}[]` para los Select del paso 2 del registro/perfil. */
export const DOCUMENT_TYPE_OPTIONS: { value: DocumentType; label: string }[] = DOCUMENT_TYPES.map(
  (value) => ({ value, label: DOCUMENT_TYPE_LABELS[value] }),
);
