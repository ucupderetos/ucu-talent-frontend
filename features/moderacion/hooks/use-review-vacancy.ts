"use client";

// Cambia el estado de una vacante desde la bandeja del Admin.
//
// El Admin SOLO mueve `PUBLICADO ↔ PENDIENTE` (ver la tabla de `VacancyStatus`
// en types/index.ts) — nunca a `FINALIZADO`. La empresa dueña es la única que
// cierra, y eso vive en el dominio `puestos`.
//
// ⚠️ ANDAMIO TEMPORAL, mismo criterio que use-review-account.ts: por ahora muta
// el `status` en fixtures. El endpoint SÍ existe en el contrato
// (`PUT /vacancy/status/{id}`, rol ADMIN, `UpdateVacancyStatusAdminRequest` —
// docs/ENDPOINTS.md), solo falta enchufarlo.
// TODO(api): reemplazar el cuerpo de `mutationFn` por la llamada real.

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { MOCK_VACANCIES } from "@/lib/fixtures";
import type { VacancyStatus } from "@/types";

export interface ReviewVacancyInput {
  vacancyId: string;
  status: Extract<VacancyStatus, "PUBLICADO" | "PENDIENTE">;
}

export function useReviewVacancy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ vacancyId, status }: ReviewVacancyInput) => {
      const vacancy = MOCK_VACANCIES.find((v) => v.vacancyId === vacancyId);
      if (!vacancy) throw new Error(`Vacante ${vacancyId} no encontrada`);

      vacancy.status = status;
      // `publicationDate` no se sella acá: la define la empresa al crear el
      // puesto (`CreateVacancyRequest.publicationDate`, obligatoria) — no es
      // un timestamp que el backend genere en la transición PENDIENTE → PUBLICADO.
      if (status === "PENDIENTE") {
        vacancy.reviewedAt = new Date().toISOString();
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
