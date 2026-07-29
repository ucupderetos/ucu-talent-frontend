"use client";

// aprueba/rechaza una cuenta (empresa o alumno), o da de baja una ya
// aprobada mandandola a RECHAZADO. pega directo a PATCH /user/{id} con
// { status, adminComment }, probado en vivo el 28/7 con empresa y alumno.

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import type { AccountResolution } from "@/features/moderacion/types";
import type { User } from "@/types";

export type ReviewAccountInput = AccountResolution & {
  /** de que perfil es la cuenta. no lo usamos para pegarle a la api (el
   *  endpoint es el mismo para los dos), solo para saber que invalidar. */
  accountType: "student" | "company";
};

export function useReviewAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, status, adminComment }: ReviewAccountInput) =>
      apiClient.patch<User>(`/user/${userId}`, { status, adminComment }),
    onSuccess: () => {
      // invalidamos todo lo que empiece con "moderacion", asi entran tanto
      // empresas como alumnos sin tener que acordarse de las dos keys
      void queryClient.invalidateQueries({ queryKey: ["moderacion"] });
    },
  });
}
