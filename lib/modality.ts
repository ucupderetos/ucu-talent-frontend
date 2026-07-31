// Diccionario de presentación de `Vacancy.modality`. Mismo patrón que
// lib/contract-types.ts y lib/departments.ts: los valores del backend no se
// traducen ni se alteran en los tipos core, se muestran vía este mapa.
//
// Vive en lib/ (no en un feature) porque lo consumen los tres roles: la vista
// de empresa (vacancy-table.tsx), el feed de alumno (vacancy-feed-*.tsx), el
// detalle (vacancy-detail-view.tsx) y moderación (vacancies de admin).

import type { Modality } from "@/types";

export const MODALITY_LABELS: Record<Modality, string> = {
  PRESENCIAL: "Presencial",
  HIBRIDO: "Híbrida",
  REMOTO: "Remota",
};

// Tupla `readonly` para servir tanto a `.map()` en la UI como a `z.enum()`.
export const MODALITIES = [
  "PRESENCIAL",
  "HIBRIDO",
  "REMOTO",
] as const satisfies readonly Modality[];

/** Forma `{value, label}[]` para los Select/MultiSelect que ofrecen el
 *  catálogo completo (filtros de vacantes). */
export const MODALITY_OPTIONS: { value: Modality; label: string }[] = MODALITIES.map((value) => ({
  value,
  label: MODALITY_LABELS[value],
}));
