// Wire: enum de tipo de contrato para Vacancy.contractType. Confirmado contra
// api-dev (2026-07-28, vía 400 con el detalle de valores válidos) — el
// contrato SRS/ENDPOINTS.md todavía lo documenta como string libre (A-15).
//
// Vive en lib/ (no en features/puestos/) siguiendo el mismo patrón que
// lib/departments.ts: lo consumen tanto el form de creación
// (job-basic-info-form.tsx) como la vista previa (job-review.tsx).

import type { ContractType } from "@/types";

export const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
  PART_TIME: "Part-time",
  FULL_TIME: "Full-time",
  FREELANCE: "Freelance",
  PASANTIA: "Pasantía",
  CONTRATO_FIJO: "Contrato fijo",
  CONTRATO_INDEFINIDO: "Contrato indefinido",
  SUPLENCIA: "Suplencia",
  BECA: "Beca",
};

// Tupla `readonly` (no `Object.keys`, que devuelve `string[]`) para que sirva
// tanto para `.map()` en la UI como para `z.enum()` en los schemas de RHF+Zod,
// que exige un tuple. `satisfies` valida que estén todos los valores del enum
// sin perder el tipo literal.
export const CONTRACT_TYPES = [
  "PART_TIME",
  "FULL_TIME",
  "FREELANCE",
  "PASANTIA",
  "CONTRATO_FIJO",
  "CONTRATO_INDEFINIDO",
  "SUPLENCIA",
  "BECA",
] as const satisfies readonly ContractType[];

/** Forma `{value, label}[]` para los Select/MultiSelect que ofrecen el
 *  catálogo completo (job-basic-info-form.tsx, edit-job-form.tsx). */
export const CONTRACT_TYPE_OPTIONS: { value: ContractType; label: string }[] = CONTRACT_TYPES.map(
  (value) => ({ value, label: CONTRACT_TYPE_LABELS[value] }),
);