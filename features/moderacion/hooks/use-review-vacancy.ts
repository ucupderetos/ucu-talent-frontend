"use client";

// El Admin mueve una vacante entre PUBLICADO y PENDIENTE. La operación real
// usa PUT /vacancy/status/{id}; FINALIZADO sigue reservado a la empresa o al
// cierre automático y no se ofrece desde la UI administrativa.

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { dashboardQueryKey } from "@/features/moderacion/hooks/use-dashboard";
import { ApiError, apiClient } from "@/lib/api-client";
import type { Vacancy, VacancyStatus } from "@/types";

export interface ReviewVacancyInput {
  vacancyId: string;
  status: Extract<VacancyStatus, "PUBLICADO" | "PENDIENTE">;
  adminComment?: string;
}

export function useReviewVacancy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ vacancyId, status, adminComment }: ReviewVacancyInput) =>
      apiClient.put<Vacancy>(`/vacancy/status/${vacancyId}`, {
        status,
        adminComment,
      }),
    onSuccess: () => {
      // Cambia el listado/detalle de Admin, el dashboard, el feed del alumno
      // y los listados de la empresa. No se espera el refetch para que una
      // fila que sale del filtro no cancele su callback local de confirmación.
      void Promise.all([
        queryClient.invalidateQueries({ queryKey: ["moderacion", "ofertas"] }),
        queryClient.invalidateQueries({ queryKey: dashboardQueryKey() }),
        queryClient.invalidateQueries({ queryKey: ["puestos"] }),
      ]);
    },
    onError: (error) => {
      // Un 403/404/409 suele indicar que otro actor cambió o eliminó la
      // oferta. Refrescamos solo este dominio para no dejar acciones obsoletas.
      if (
        error instanceof ApiError &&
        (error.status === 403 || error.status === 404 || error.status === 409)
      ) {
        void queryClient.invalidateQueries({
          queryKey: ["moderacion", "ofertas"],
        });
      }
    },
  });
}
