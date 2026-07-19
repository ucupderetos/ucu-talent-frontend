// Tipos del dominio: perfil de empresa (MER: `Company`).
//
// Las entidades core viven en @/types. Acá va lo específico: payloads de
// edición del formulario de perfil.
//
// ⚠️ PROVISORIO: varios campos del mockup no tienen respaldo en el contrato
// actual del back (ver CompanyProfileUiOnlyInput más abajo). Confirmar con
// backend si se agregan a `Company` o si quedan fuera del MVP.

/**
 * Payload de edición de `Company`, tal como lo espera `UpdateCompanyRequest`.
 *
 * OJO: no incluye el nombre de la empresa — ese vive en `User.name`, no en
 * `Company` (ver `CompanyOwnerInput`).
 */
export interface CompanyProfileInput {
  industry: string; // Company.industry — texto libre, no hay catálogo cerrado en el back
  description: string;
  webUrl: string;
  linkedinUrl: string;
  /** Enum `Department` del back (19 departamentos de Uruguay). */
  location: string;
}

/** Datos que viven en `User`, no en `Company`. */
export interface CompanyOwnerInput {
  name: string; // User.name — se muestra como "nombre de la empresa"
}

/**
 * Campos del mockup de Figma sin respaldo en `Company` hoy: logo, tamaño de
 * empresa, año de fundación, Instagram y Facebook (solo `linkedinUrl` existe
 * en el back). Se mantienen como estado de UI para no perder el diseño, pero
 * NO se envían en el payload de guardado hasta que se confirme el alcance.
 *
 * ⚠️ PENDIENTE DE ACLARAR: confirmar con el equipo si se agregan a `Company`
 * o si quedan fuera del MVP.
 */
export interface CompanyProfileUiOnlyInput {
  companySize: string;
  foundedYear: string;
  instagramUrl: string;
  facebookUrl: string;
}

/** Estado completo del formulario: lo que va al back + lo que es solo UI. */
export type CompanyProfileFormValues = CompanyProfileInput &
  CompanyOwnerInput &
  CompanyProfileUiOnlyInput;

export const DESCRIPTION_MAX = 1000;

/** Enum `Department` del back. */
export const DEPARTMENTS = [
  "ARTIGAS", "CANELONES", "CERRO_LARGO", "COLONIA", "DURAZNO", "FLORES",
  "FLORIDA", "LAVALLEJA", "MALDONADO", "MONTEVIDEO", "PAYSANDU", "RIO_NEGRO",
  "RIVERA", "ROCHA", "SALTO", "SAN_JOSE", "SORIANO", "TACUAREMBO", "TREINTA_Y_TRES",
] as const;

export const DEPARTMENT_LABELS: Record<string, string> = {
  ARTIGAS: "Artigas", CANELONES: "Canelones", CERRO_LARGO: "Cerro Largo",
  COLONIA: "Colonia", DURAZNO: "Durazno", FLORES: "Flores", FLORIDA: "Florida",
  LAVALLEJA: "Lavalleja", MALDONADO: "Maldonado", MONTEVIDEO: "Montevideo",
  PAYSANDU: "Paysandú", RIO_NEGRO: "Río Negro", RIVERA: "Rivera", ROCHA: "Rocha",
  SALTO: "Salto", SAN_JOSE: "San José", SORIANO: "Soriano",
  TACUAREMBO: "Tacuarembó", TREINTA_Y_TRES: "Treinta y Tres",
};