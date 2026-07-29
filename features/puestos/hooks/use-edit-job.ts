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
 * ⚠️ Corrección 2026-07-29 (AGENTS.md A-15): `docs/ENDPOINTS.md` documenta
 * `UpdateVacancyRequest.salary`, pero probado a mano contra Swagger en
 * `api-dev`, el `PUT /vacancy/{id}` real solo aplica el cambio si el campo
 * se llama `salaryRange` — con `salary` el request devuelve 200 pero el
 * valor queda sin tocar. La `VacancyResponse` de lectura SÍ usa `salary`
 * (confirmado en el propio Swagger), así que es un wire distinto por
 * dirección: el back renombró el campo de lectura pero no el de escritura.
 * Se traduce acá, en el borde de red, para no ensuciar `VacancyUpdateInput`
 * (que sigue en `salary`, igual que el resto de la UI) con el nombre viejo.
 */
function editVacancyRequest(vacancyId: string, payload: VacancyUpdateInput): Promise<Vacancy> {
  const { salary, ...rest } = payload;
  return apiClient.put<Vacancy>(`/vacancy/${vacancyId}`, { ...rest, salaryRange: salary });
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
