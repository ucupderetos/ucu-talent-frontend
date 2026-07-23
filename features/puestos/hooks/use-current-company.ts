"use client";

// Resuelve la `Company` del usuario logueado (rol empresa), vía GET /company.
//
// Se apoya en `useSession()` para el `userId` — no dispara el fetch hasta
// tener sesión resuelta. TanStack Query dedupea por queryKey, así que llamar
// a este hook desde varios componentes no repite el request.
//
// En modo mock (NEXT_PUBLIC_MOCK_SESSION), devuelve la Company de fixtures en
// vez de pegarle al back real — mismo atajo que getDisplayProfile en
// lib/auth.ts, para poder trabajar sin depender de la cookie cross-origin
// (A-13 en AGENTS.md) mientras no esté resuelta.

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import { MOCK_COMPANIES } from "@/lib/fixtures";
import { useSession } from "@/features/auth/hooks/use-session";
import type { Company } from "@/types";

export const CURRENT_COMPANY_QUERY_KEY = ["empresa-actual"] as const;

const MOCK_ROLE = process.env.NEXT_PUBLIC_MOCK_SESSION;

interface CurrentCompany {
  company: Company | null;
  isLoading: boolean;
}

export function useCurrentCompany(): CurrentCompany {
  const { user, isLoading: isSessionLoading } = useSession();

  const { data, isPending } = useQuery({
    queryKey: [...CURRENT_COMPANY_QUERY_KEY, user?.userId],
    queryFn: ({ signal }) => {
      if (MOCK_ROLE) {
        const mock = MOCK_COMPANIES.find((c) => c.companyId === user!.userId);
        return Promise.resolve(mock ?? null);
      }
      return apiClient.get<Company>("/company", { params: { userId: user!.userId }, signal });
    },
    enabled: user != null,
  });

  const isLoading = isSessionLoading || (user != null && isPending);
  return { company: data ?? null, isLoading };
}