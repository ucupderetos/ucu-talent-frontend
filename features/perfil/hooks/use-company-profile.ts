"use client";

// Semilla del formulario de perfil de empresa: trae la `Company` del usuario
// logueado y la mapea al view-model `CompanyProfile`.
//
// Wire: `GET /company/{id}` (docs/ENDPOINTS.md, sección 3) — 🔒 Autenticado,
// devuelve `CompanyResponse`. Como la PK es compartida (`companyId ===
// userId`), el `userId` de la sesión alcanza para resolverla.
//
// ⚠️ Path param, NO query param (`?userId=`) — mismo bug que documenta
// lib/auth.ts (getDisplayProfile): el recurso propio va por
// `/company/{id}`, `/company?userId=` da `403` contra api-dev aunque el
// perfil exista.

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import { useSession } from "@/hooks/use-session";
import type { Company } from "@/types";
import type { CompanyProfile } from "@/features/perfil/types";

/** @public para invalidar desde `use-update-company-profile.ts`. */
export function companyProfileQueryKey(userId: string | undefined) {
  return ["perfil", "empresa", userId] as const;
}

/**
 * Mapea la `Company` que devuelve la API al `CompanyProfile` que edita el
 * formulario — solo renombra `name` → `legalName`. La imagen de la empresa no
 * viene por acá: irá en `User.imageUrl` cuando el backend la exponga.
 */
function toCompanyProfile(company: Company): CompanyProfile {
  return {
    legalName: company.name,
    industry: company.industry,
    description: company.description,
    webUrl: company.webUrl,
    linkedinUrl: company.linkedinUrl,
    location: company.location,
  };
}

async function fetchCompanyProfile(
  userId: string,
  signal?: AbortSignal,
): Promise<CompanyProfile> {
  const company = await apiClient.get<Company>(`/company/${userId}`, { signal });
  return toCompanyProfile(company);
}

/** Perfil de empresa del usuario logueado, listo para sembrar el formulario. */
export function useCompanyProfile() {
  const { user, isLoading: isSessionLoading } = useSession();

  const query = useQuery({
    queryKey: companyProfileQueryKey(user?.userId),
    queryFn: ({ signal }) => fetchCompanyProfile(user!.userId, signal),
    enabled: user != null,
  });

  return {
    profile: query.data,
    isLoading: isSessionLoading || (user != null && query.isPending),
    isError: query.isError,
  };
}
