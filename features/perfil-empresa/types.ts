// Tipos del dominio: perfil de empresa (MER: `Company`).
//
// Las entidades core viven en @/types. Acá va lo específico: el payload de
// edición del formulario de perfil.
//
// ⚠️ Actualizado contra el MER (posterior al SRS, ver AGENTS.md → "Las tres
// fuentes y su orden de precedencia"). El MER sacó los datos personales de
// `User` y los pasó a cada perfil (`Company` incluido), y agregó `rut` y
// `phone_number` a `Company`. Por eso ya no existe un `CompanyOwnerInput`
// separado que pegue en `User`: todo el perfil de empresa, incluida la razón
// social, es una sola entidad y se guarda con un único PUT.

/**
 * Payload de edición de `Company`, tal como debería esperarlo
 * `UpdateCompanyRequest` una vez que el backend lo exponga (ver AGENTS.md →
 * A-11 para `logoUrl`: el campo existe en el MER pero todavía no hay
 * endpoint de upload, así que por ahora se resuelve con preview local).
 */
export interface CompanyProfileInput {
  razonSocial: string; // Company.razon_social — antes vivía (mal) en User.name
  rut: string; // Company.rut — identificador fiscal, nuevo en el MER
  phoneNumber: string; // Company.phone_number — movido de User al MER
  industry: string; // texto libre, no hay catálogo cerrado en el back
  description: string;
  webUrl: string;
  linkedinUrl: string;
  /** Enum `Department` del back (19 departamentos de Uruguay). */
  location: string;
  /** Company.logo_url — bucket. Sin endpoint de upload todavía (A-11). */
  logoUrl: string;
}

/** Estado completo del formulario. Ya no hay campos "solo UI": todos los
 *  que se muestran en pantalla tienen respaldo en `Company` del MER. */
export type CompanyProfileFormValues = CompanyProfileInput;

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