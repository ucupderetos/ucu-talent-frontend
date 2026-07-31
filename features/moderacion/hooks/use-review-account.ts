"use client";

// aprueba/rechaza una cuenta (empresa o alumno), o da de baja una ya
// aprobada mandandola a RECHAZADO. pega directo a PATCH /user/{id} con
// { status, adminComment }, probado en vivo el 28/7 con empresa y alumno.

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ApiError, apiClient } from "@/lib/api-client";
import type { AccountResolution } from "@/features/moderacion/types";
import type { User } from "@/types";

export type ReviewAccountInput = AccountResolution & {
  /** Contexto del caller; el endpoint y la invalidación son compartidos. */
  accountType: "ALUMNO" | "EMPRESA";
};

export function useReviewAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, status, adminComment }: ReviewAccountInput) =>
      apiClient.patch<User>(`/user/${encodeURIComponent(userId)}`, {
        status,
        adminComment,
      }),
    onSuccess: () => {
      // invalidamos todo lo que empiece con "moderacion", asi entran tanto
      // empresas como alumnos sin tener que acordarse de las dos keys. No se
      // espera el refetch: una fila filtrada puede desmontarse y cancelar el
      // callback local que muestra el toast de confirmación.
      void queryClient.invalidateQueries({ queryKey: ["moderacion"] });
    },
    onError: (error) => {
      // Si otro Admin cambió o eliminó la cuenta, refrescar evita conservar
      // acciones basadas en un estado viejo. Los errores de red no refetchean.
      if (
        error instanceof ApiError &&
        (error.status === 404 || error.status === 409)
      ) {
        void queryClient.invalidateQueries({ queryKey: ["moderacion"] });
      }
    },
  });
}
