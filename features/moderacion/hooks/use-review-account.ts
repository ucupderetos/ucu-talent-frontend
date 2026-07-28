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
  MOCK_COMPANIES,
  MOCK_COMPANY_USERS,
  MOCK_PENDING_STUDENT_USERS,
  MOCK_STUDENT_PROFILES,
} from "@/lib/fixtures";
import type { AccountResolution } from "@/features/moderacion/types";

export type ReviewAccountInput = AccountResolution & {
  /** Tipo de perfil cuya cuenta se modera. */
  accountType: "student" | "company";
};

export function useReviewAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, accountType, status, adminComment }: ReviewAccountInput) => {
      // TODO(api): apiClient.patch(`/user/${userId}`, { status, adminComment })
      const pool = accountType === "student" ? MOCK_PENDING_STUDENT_USERS : MOCK_COMPANY_USERS;
      const user = pool.find((u) => u.userId === userId);
      if (user) user.status = status;

      // El backend guarda status/adminComment/reviewedAt también en el perfil
      // (StudentProfile/Company, no solo en User) — se replica acá para que
      // las dos fuentes no queden desincronizadas en el mock.
      const reviewedAt = new Date().toISOString();
      if (accountType === "student") {
        const profile = MOCK_STUDENT_PROFILES.find((p) => p.studentProfileId === userId);
        if (profile) Object.assign(profile, { status, reviewedAt, adminComment: adminComment ?? null });
      } else {
        const profile = MOCK_COMPANIES.find((p) => p.companyId === userId);
        if (profile) Object.assign(profile, { status, reviewedAt, adminComment: adminComment ?? null });
      }
    },
    onSuccess: () => {
      // Invalida ambas colas (empresas y alumnos) — todas cuelgan de "moderacion".
      void queryClient.invalidateQueries({ queryKey: ["moderacion"] });
    },
  });
}
