"use client";

// Editar una oferta ya publicada — `PUT /vacancy/{id}` real (EMPRESA + dueña,
// docs/ENDPOINTS.md). A diferencia de `use-publish-job.ts` (POST /vacancy),
// acá no hace falta resolver `companyId` ni `areaId`: el backend identifica
// la vacante por el `{id}` de la URL y el área no es editable (ver
// `VacancyUpdateInput` en features/puestos/types.ts).

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import { vacancyQueryKey } from "@/features/puestos/hooks/use-vacancy";
import type { VacancyUpdateInput } from "@/features/puestos/types";
import type { Vacancy } from "@/types";

/**
 * ⚠️ Corrección 2026-07-30: la corrección anterior (`docs/agents/open-questions.md` A-15) traducía
 * `salary` → `salaryRange` en el borde de red, basada en una prueba a mano
 * contra Swagger del 2026-07-29. Verificado ahora directo contra el código
 * fuente del backend (`vacancy/dto/UpdateVacancyRequest.java`, rama `dev`):
 * el campo se llama `salary`, sin `salaryRange` en ningún lado del DTO — el
 * backend debe haber corregido esa inconsistencia entre el 29 y el 30. Con
 * la traducción vieja, `PUT /vacancy/{id}` mandaba un `salaryRange` que el
 * DTO real ignora: el salario dejaba de actualizarse en silencio. Se saca la
 * traducción y se manda `salary` tal cual, igual que `POST /vacancy`.
 */
function editVacancyRequest(vacancyId: string, payload: VacancyUpdateInput): Promise<Vacancy> {
  return apiClient.put<Vacancy>(`/vacancy/${vacancyId}`, payload);
}

export function useEditJob(vacancyId: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: VacancyUpdateInput) => editVacancyRequest(vacancyId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vacancyQueryKey(vacancyId) });
      // La tabla de "Mis ofertas" cachea por
      // `["puestos", "empresa", companyId, filters]` (use-company-vacancies.ts),
      // y `filters` varía por pantalla — se invalida por prefijo en vez de
      // reconstruir la queryKey exacta.
      queryClient.invalidateQueries({ queryKey: ["puestos", "empresa"] });
    },
  });

  return {
    edit: mutation.mutateAsync,
    isLoading: mutation.isPending,
  };
}
