"use client";

// Resuelve la `Company` del usuario logueado (rol empresa).
//
// Vive en hooks/ (no en features/puestos/) porque no es un concepto del
// dominio "puestos": lo necesitan por igual "Mis ofertas" (puestos) y
// "Postulantes" (postulaciones), y la regla del equipo es no importar
// features/ de otro dominio — por eso este accesor, como toda la capa de
// sesión, sube al bucket `hooks/` de nivel raíz, junto a use-session.ts.

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import { useSession } from "@/hooks/use-session";
import type { Company } from "@/types";

interface CurrentCompany {
  company: Company | null;
  isLoading: boolean;
}

function fetchCurrentCompany(userId: string, signal?: AbortSignal): Promise<Company | null> {
  // PK compartida: `companyId` de `Company` ES el `userId` de la sesión.
  return apiClient.get<Company>(`/company/${userId}`, { signal });
}

export function useCurrentCompany(): CurrentCompany {
  const { user, isLoading: isSessionLoading } = useSession();
  const shouldFetchCompany = user?.role === "EMPRESA";

  const query = useQuery({
    queryKey: ["empresa", "actual", user?.userId] as const,
    queryFn: ({ signal }) => fetchCurrentCompany(user?.userId ?? "", signal),
    enabled: shouldFetchCompany,
  });

  return {
    company: query.data ?? null,
    isLoading: isSessionLoading || (shouldFetchCompany && query.isPending),
  };
}
