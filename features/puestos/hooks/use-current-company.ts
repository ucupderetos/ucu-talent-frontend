"use client";

// Resuelve la `Company` del usuario logueado (rol empresa).
//
// ⚠️ ANDAMIO TEMPORAL: el MER separa `User` de `Company` (`Company.userId` es
// la FK), pero todavía no existe un endpoint tipo `GET /companies/me` — el
// contrato de la API no está definido (ver AGENTS.md). Mientras tanto, esto
// resuelve la empresa buscando en fixtures por `userId`.
//
// Se apoya en `useSession()`, que ya dedupe el `GET /me` por queryKey, así que
// llamar a este hook desde varios componentes no dispara requests de más.
//
// TODO(api): cuando exista el endpoint real, esto pasa a un `useQuery` propio
// (o directamente viene incluido en la sesión) y se borra la búsqueda en
// fixtures.

import { MOCK_COMPANIES } from "@/lib/fixtures";
import { useSession } from "@/features/auth/hooks/use-session";
import type { Company } from "@/types";

interface CurrentCompany {
  company: Company | null;
  isLoading: boolean;
}

export function useCurrentCompany(): CurrentCompany {
  const { user, isLoading } = useSession();

  if (isLoading || !user) return { company: null, isLoading };

  // PK compartida: `companyId` de `Company` ES el `userId` de la sesión.
  const company = MOCK_COMPANIES.find((c) => c.companyId === user.userId) ?? null;
  return { company, isLoading: false };
}
