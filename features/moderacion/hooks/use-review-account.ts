"use client";

// Cambia el estado de una cuenta (empresa o alumno): permite aprobar/rechazar
// una pendiente y dar de baja una aprobada llevándola a RECHAZADO.
// Wire: `PATCH /user/{id}` con { status, adminComment } — A-02 (✅) lo confirma.
//
// ⚠️ ANDAMIO TEMPORAL: por ahora muta el `status` del user en fixtures (mismo
// criterio que use-mark-applicant-viewed). TODO(api): reemplazar el cuerpo de
// `mutationFn` por `apiClient.patch(\`/user/${userId}\`, { status, adminComment })`.

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  MOCK_APPLICANT_USERS,
  MOCK_COMPANY_USERS,
  MOCK_PENDING_STUDENT_USERS,
  MOCK_STUDENT_USERS,
  MOCK_USERS,
} from "@/lib/fixtures";
import type { AccountResolution } from "@/features/moderacion/types";

export type ReviewAccountInput = AccountResolution & {
  /** Tipo de perfil cuya cuenta se modera. */
  accountType: "student" | "company";
};

export function useReviewAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, accountType, status }: ReviewAccountInput) => {
      // TODO(api): apiClient.patch(`/user/${userId}`, { status, adminComment })
      const user =
        accountType === "student"
          ? (MOCK_STUDENT_USERS.find((candidate) => candidate.userId === userId) ??
            MOCK_PENDING_STUDENT_USERS.find((candidate) => candidate.userId === userId) ??
            MOCK_APPLICANT_USERS.find((candidate) => candidate.userId === userId))
          : (MOCK_COMPANY_USERS.find((candidate) => candidate.userId === userId) ??
            (MOCK_USERS.EMPRESA.userId === userId ? MOCK_USERS.EMPRESA : undefined));

      if (!user) throw new Error(`No se encontró la cuenta ${userId}.`);

      user.status = status;
    },
    onSuccess: () => {
      // Invalida ambas colas (empresas y alumnos) — todas cuelgan de "moderacion".
      void queryClient.invalidateQueries({ queryKey: ["moderacion"] });
    },
  });
}
