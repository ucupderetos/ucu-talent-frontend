"use client";

// Finalizar una oferta propia — `PATCH /vacancy/status/{id}` real (EMPRESA +
// dueña, docs/ENDPOINTS.md). Terminal (RF-PUE-03): solo se dispara desde
// `PUBLICADO`, no hay operación inversa, y deja de aparecer en el feed apenas
// se invalida `feedVacanciesQueryKey()` — ver `CompanyVacancyStatusChange` en
// features/puestos/types.ts. Quien ya se postuló sigue viendo la vacante por
// `GET /vacancy/{id}` ("Mis postulaciones"), que no filtra por status.

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import { vacancyQueryKey } from "@/features/puestos/hooks/use-vacancy";
import { feedVacanciesQueryKey } from "@/features/puestos/hooks/use-feed-vacancies";
import type { CompanyVacancyStatusChange } from "@/features/puestos/types";
import type { Vacancy } from "@/types";

function closeVacancyRequest(vacancyId: string): Promise<Vacancy> {
  const body: CompanyVacancyStatusChange = { status: "FINALIZADO" };
  return apiClient.patch<Vacancy>(`/vacancy/status/${vacancyId}`, body);
}

export function useCloseJob() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (vacancyId: string) => closeVacancyRequest(vacancyId),
    onSuccess: (_data, vacancyId) => {
      queryClient.invalidateQueries({ queryKey: vacancyQueryKey(vacancyId) });
      // Mismo criterio que use-edit-job.ts: "Mis ofertas" cachea por
      // ["puestos", "empresa", companyId, filters] — se invalida por prefijo.
      queryClient.invalidateQueries({ queryKey: ["puestos", "empresa"] });
      // El feed de alumno filtra por status en memoria sobre datos ya
      // cacheados (use-feed-vacancies.ts) — sin esto, la vacante finalizada
      // seguiría viéndose ahí hasta el próximo refetch natural.
      queryClient.invalidateQueries({ queryKey: feedVacanciesQueryKey() });
    },
  });

  return {
    close: mutation.mutateAsync,
    isLoading: mutation.isPending,
  };
}
