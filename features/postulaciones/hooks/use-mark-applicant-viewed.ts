"use client";

// Transición PENDIENTE → VISTO: dispara automáticamente cuando la empresa
// abre el detalle de un postulante (RN documentada en AGENTS.md — "Postulaciones:
// máquina de estados"). No es una acción manual del usuario, por eso no hay un
// botón para esto: se llama sola desde `applicant-detail-view.tsx` al montarse.
//
// ⚠️ ANDAMIO TEMPORAL: `PUT /vacancy-application/{id}` (wire:
// `UpdateVacancyApplicationRequest`, ver features/postulaciones/types.ts)
// todavía no tiene contrato confirmado en este repo — esto muta el array de
// fixtures en memoria como sustituto. TODO(api): cuando exista, pasa a
// `apiClient.put(...)`.
//
// `VISTO → FINALIZADA` NO se implementa acá: es automático en cascada al
// cerrar la vacante (lo dispara el sistema, no la empresa) — no hay ninguna
// acción de la empresa que lo gatille desde esta pantalla.

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { MOCK_APPLICATIONS } from "@/lib/fixtures";

export function useMarkApplicantViewed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vacancyApplicationId: string) => {
      const application = MOCK_APPLICATIONS.find(
        (a) => a.vacancyApplicationId === vacancyApplicationId,
      );
      if (application && application.status === "PENDIENTE") {
        application.status = "VISTO";
      }
      return application;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["postulantes"] });
    },
  });
}
