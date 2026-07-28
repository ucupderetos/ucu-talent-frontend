"use client";

// Datos mock de perfil de empresa para desarrollo, mientras no exista
// GET /company?userId= (ver AGENTS.md). Sin esto, CompanyProfileReadOnly y
// CompanyProfilePreview siempre muestran "Sin completar" — no hay forma de
// revisarlos con contenido real.

import { MOCK_COMPANIES } from "@/lib/fixtures";
import type { Company } from "@/types";
import type { CompanyProfile } from "@/features/perfil/types";

/**
 * Mapea una `Company` (la que expone hoy la API real / fixtures) al
 * `CompanyProfile` que espera el formulario. Rellena con valores de muestra
 * los campos que el MER define pero que `docs/ENDPOINTS.md` todavía no
 * expone (razonSocial → legalName, rut, phoneNumber, logoUrl) — ver el
 * comentario de CompanyProfile en features/perfil/types.ts.
 */
function toCompanyProfile(company: Company): CompanyProfile {
  return {
    legalName: company.name,
    rut: "210000000000", // TODO: sin respaldo en la API todavía
    phoneNumber: "099123456", // TODO: sin respaldo en la API todavía
    industry: company.industry,
    description: company.description,
    webUrl: company.webUrl,
    linkedinUrl: company.linkedinUrl,
    location: company.location,
    logoUrl: "", // TODO: sin endpoint de upload todavía
  };
}

/** Perfil de empresa mock, listo para usar como semilla del formulario. */
export function useCompanyProfile(): CompanyProfile {
  return toCompanyProfile(MOCK_COMPANIES[0]);
}