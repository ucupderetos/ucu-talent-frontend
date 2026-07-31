"use client";

// Transición PENDIENTE → VISTO: dispara automáticamente cuando la empresa
// abre el detalle de un postulante (RN documentada en
// `docs/agents/applications-state-machine.md`). No es una acción manual del usuario, por eso no hay un
// botón para esto: se llama sola desde `applicant-detail-view.tsx` al montarse,
// y solo cuando el estado actual es "PENDIENTE" (ver el guard ahí) — este hook
// no necesita repetir esa validación.
//
// Wire: `PUT /vacancy-application/{id}` con `UpdateVacancyApplicationRequest
// { status: "VISTO" }` (empresa dueña, docs/ENDPOINTS.md sección 6).
//
// `VISTO → FINALIZADO` NO se implementa acá — tampoco es automático en el
// backend: cerrar la vacante solo dispara el mail de cierre, nunca toca
// `VacancyApplication.status`. Esa transición sigue sin una acción de UI en
// esta pantalla.

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import type { VacancyApplication } from "@/types";

export function useMarkApplicantViewed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vacancyApplicationId: string) => markViewed(vacancyApplicationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["postulantes"] });
    },
  });
}

async function markViewed(vacancyApplicationId: string): Promise<VacancyApplication> {
  return apiClient.put<VacancyApplication>(`/vacancy-application/${vacancyApplicationId}`, {
    status: "VISTO",
  });
}
