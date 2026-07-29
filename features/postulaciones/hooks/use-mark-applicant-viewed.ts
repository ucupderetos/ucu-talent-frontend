"use client";

// Transición PENDIENTE → VISTO: dispara automáticamente cuando la empresa
// abre el detalle de un postulante (RN documentada en AGENTS.md — "Postulaciones:
// máquina de estados"). No es una acción manual del usuario, por eso no hay un
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
import { MOCK_APPLICATIONS } from "@/lib/fixtures";
import type { VacancyApplication } from "@/types";

const MOCK_ROLE = process.env.NEXT_PUBLIC_MOCK_SESSION;

export function useMarkApplicantViewed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vacancyApplicationId: string) => markViewed(vacancyApplicationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["postulantes"] });
    },
  });
}

async function markViewed(vacancyApplicationId: string): Promise<VacancyApplication | undefined> {
  if (MOCK_ROLE) {
    const application = MOCK_APPLICATIONS.find(
      (a) => a.vacancyApplicationId === vacancyApplicationId,
    );
    if (application && application.status === "PENDIENTE") {
      application.status = "VISTO";
    }
    return application;
  }

  return apiClient.put<VacancyApplication>(`/vacancy-application/${vacancyApplicationId}`, {
    status: "VISTO",
  });
}
