"use client";

// Cambia el estado de una vacante desde la bandeja del Admin.
//
// El Admin es el único que puede mover una vacante a cualquiera de los 3
// estados (ver la tabla de `VacancyStatus` en types/index.ts). La empresa dueña
// solo cierra, y eso vive en el dominio `puestos`.
//
// ⚠️ ANDAMIO TEMPORAL, mismo criterio que use-review-account.ts: por ahora muta
// el `status` en fixtures. AGENTS.md A-02 confirma el endpoint administrativo
// `PUT /vacancy/status/{id}`; falta conectar acá su payload real.

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { MOCK_VACANCIES } from "@/lib/fixtures";
import type { VacancyStatus } from "@/types";

export interface ReviewVacancyInput {
  vacancyId: string;
  status: VacancyStatus;
}

export function useReviewVacancy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ vacancyId, status }: ReviewVacancyInput) => {
      const vacancy = MOCK_VACANCIES.find((v) => v.vacancyId === vacancyId);
      if (!vacancy) throw new Error(`Vacante ${vacancyId} no encontrada`);

      vacancy.status = status;
      // Al publicar por primera vez se sella la fecha; el resto de las
      // transiciones no la tocan.
      if (status === "PUBLICADO" && !vacancy.publicationDate) {
        vacancy.publicationDate = new Date().toISOString();
      }
    },
    onSuccess: () => {
      // La bandeja del Admin cuelga de "moderacion"; el feed del alumno y "Mis
      // ofertas" de la empresa cuelgan de "puestos" y también cambian.
      queryClient.invalidateQueries({ queryKey: ["moderacion"] });
      queryClient.invalidateQueries({ queryKey: ["puestos"] });
    },
  });
}
