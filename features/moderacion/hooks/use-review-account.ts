"use client";

// Aprueba o rechaza una cuenta pendiente (empresa o alumno) contra el padrón.
// Wire: `PATCH /user/{id}` con { status, adminComment } — A-02 (✅) lo confirma.
//
// ⚠️ ANDAMIO TEMPORAL: por ahora muta el `status` del user en fixtures (mismo
// criterio que use-mark-applicant-viewed). TODO(api): reemplazar el cuerpo de
// `mutationFn` por `apiClient.patch(\`/user/${userId}\`, { status, adminComment })`.

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { MOCK_COMPANY_USERS, MOCK_PENDING_STUDENT_USERS } from "@/lib/fixtures";
import type { AccountResolution } from "@/features/moderacion/types";

export type ReviewAccountInput = AccountResolution & {
  /** De qué cola viene la cuenta — define qué array de fixtures mutar. */
  accountType: "student" | "company";
};

export function useReviewAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, accountType, status }: ReviewAccountInput) => {
      // TODO(api): apiClient.patch(`/user/${userId}`, { status, adminComment })
      const pool = accountType === "student" ? MOCK_PENDING_STUDENT_USERS : MOCK_COMPANY_USERS;
      const user = pool.find((u) => u.userId === userId);
      if (user) user.status = status;
    },
    onSuccess: () => {
      // Invalida ambas colas (empresas y alumnos) — todas cuelgan de "moderacion".
      queryClient.invalidateQueries({ queryKey: ["moderacion"] });
    },
  });
}
