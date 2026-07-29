"use client";

// Moderación real de una cuenta de empresa.
// Wire: PATCH /user/{id} con { status, adminComment? } (docs/ENDPOINTS.md).
// Se mantiene separado del andamio de alumnos para no mezclar lecturas reales
// de empresas con los fixtures que todavía alimentan ese otro flujo.

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { adminCompaniesQueryKey } from "@/features/moderacion/hooks/use-admin-companies";
import type { AccountResolution } from "@/features/moderacion/types";
import { apiClient } from "@/lib/api-client";
import type { User } from "@/types";

export type ReviewCompanyAccountInput = AccountResolution;

export function useReviewCompanyAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, status, adminComment }: ReviewCompanyAccountInput) =>
      apiClient.patch<User>(`/user/${encodeURIComponent(userId)}`, { status, adminComment }),
    onSuccess: async () => {
      // La misma raíz cubre listado, filtros derivados, cola de pendientes y
      // cualquier detalle de empresa abierto.
      await queryClient.invalidateQueries({ queryKey: adminCompaniesQueryKey() });
    },
  });
}
