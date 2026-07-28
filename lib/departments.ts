// Catálogo de los 19 departamentos de Uruguay (`Department` en types/index.ts).
// Compartido por auth (registro), perfil (alumno y empresa) y puestos (alta
// de oferta) — antes vivía duplicado con forma distinta en cada uno de esos
// 4 archivos.

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

/** Forma `{value, label}[]`, ya en orden alfabético por label — la que
 *  necesitan los combobox/select de auth y perfil. */
export const DEPARTMENT_OPTIONS: { value: Department; label: string }[] = DEPARTMENTS.map(
  (value) => ({ value, label: DEPARTMENT_LABELS[value] }),
);
