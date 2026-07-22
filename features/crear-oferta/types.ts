// Tipos y catálogos del dominio: crear oferta (MER/wire: `Vacancy`).
//
// El payload real de creación vive en features/puestos/types.ts
// (`VacancyInput`), que ya refleja `CreateVacancyRequest`. Acá va lo
// específico de este wizard: el catálogo de departamentos para el Select.
//
// ⚠️ DUPLICADO A PROPÓSITO: el mismo array ya existe (con distinta forma)
// en features/auth/components/register-form.tsx y
// features/perfil/components/complete-profile-form.tsx. Ninguno de los 3
// dominios lo centralizó todavía — no lo hacemos acá tampoco para no tocar
// una zona de conflicto (types/index.ts o lib/) sin coordinarlo con el
// equipo primero. Si se centraliza más adelante, este archivo se actualiza.

import type { Department } from "@/types";

export const DEPARTMENTS: readonly Department[] = [
  "ARTIGAS", "CANELONES", "CERRO_LARGO", "COLONIA", "DURAZNO", "FLORES",
  "FLORIDA", "LAVALLEJA", "MALDONADO", "MONTEVIDEO", "PAYSANDU", "RIO_NEGRO",
  "RIVERA", "ROCHA", "SALTO", "SAN_JOSE", "SORIANO", "TACUAREMBO", "TREINTA_Y_TRES",
];

export const DEPARTMENT_LABELS: Record<Department, string> = {
  ARTIGAS: "Artigas", CANELONES: "Canelones", CERRO_LARGO: "Cerro Largo",
  COLONIA: "Colonia", DURAZNO: "Durazno", FLORES: "Flores", FLORIDA: "Florida",
  LAVALLEJA: "Lavalleja", MALDONADO: "Maldonado", MONTEVIDEO: "Montevideo",
  PAYSANDU: "Paysandú", RIO_NEGRO: "Río Negro", RIVERA: "Rivera", ROCHA: "Rocha",
  SALTO: "Salto", SAN_JOSE: "San José", SORIANO: "Soriano",
  TACUAREMBO: "Tacuarembó", TREINTA_Y_TRES: "Treinta y Tres",
};