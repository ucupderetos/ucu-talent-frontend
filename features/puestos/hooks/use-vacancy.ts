"use client";

// Detalle de una vacante (vista alumno) — RF-PUE.
//
// docs/ENDPOINTS.md, sección 8 ("Mapa de integración"): el detalle sale de
// `GET /vacancy/{id}` + `GET /company/{companyId}` (no hay un único endpoint
// que devuelva ambos ya resueltos).

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient, ApiError } from "@/lib/api-client";
import type { VacancyDetail } from "@/features/puestos/types";
import type { Area, Company, Vacancy, VacancyApplication } from "@/types";

/** @public para invalidación puntual futura (AGENTS.md). */
export function vacancyQueryKey(vacancyId: string) {
  return ["puestos", vacancyId] as const;
}

export function useVacancy(vacancyId: string) {
  return useQuery({
    queryKey: vacancyQueryKey(vacancyId),
    queryFn: () => fetchVacancy(vacancyId),
  });
}

async function fetchVacancy(vacancyId: string): Promise<VacancyDetail | null> {
  const vacancy = await apiClient.get<Vacancy>(`/vacancy/${vacancyId}`);

  const [company, areas] = await Promise.all([
    apiClient.get<Company>(`/company/${vacancy.companyId}`),
    apiClient.get<Area[]>("/area"),
  ]);

  const area = areas.find((a) => a.areaId === vacancy.areaId);
  const parentArea = area?.parentAreaId
    ? areas.find((a) => a.areaId === area.parentAreaId)
    : undefined;

  return {
    ...vacancy,
    company,
    areaName: area?.name ?? "—",
    parentAreaName: parentArea?.name ?? null,
  };
}

/**
 * RN-05: un alumno no puede postularse dos veces a la misma vacante.
 *
 * `GET /vacancy-application/me` es el mismo endpoint que arma "Mis
 * postulaciones" (`features/postulaciones/hooks/use-my-applications.ts`) —
 * se pega directo acá en vez de importar el hook de ese dominio (regla de
 * AGENTS.md: no importar entre `features/`), pero se usa DELIBERADAMENTE la
 * misma queryKey para que TanStack Query dedupe el fetch si las dos
 * pantallas están montadas a la vez (AGENTS.md: "Query ya deduplica por
 * queryKey", el motivo por el que no hace falta un Context compartido).
 */
export function useHasApplied(vacancyId: string, studentProfileId: string | undefined) {
  const query = useQuery({
    queryKey: ["postulaciones", "mias", studentProfileId] as const,
    queryFn: () => apiClient.get<{ vacancyId: string }[]>("/vacancy-application/me"),
    enabled: studentProfileId != null,
  });

  return query.data?.some((application) => application.vacancyId === vacancyId) ?? false;
}

/**
 * Postularse a una vacante — RF-POS-01. Wire: `POST /vacancy-application`,
 * body `{ vacancyId }` (docs/ENDPOINTS.md, sección 6). Requiere ALUMNO +
 * cuenta `APROBADO` — el gate de RN-16 ya lo resuelve `ApplyAction` en
 * `vacancy-detail-view.tsx` antes de llamar a esto.
 *
 * Vive acá (dominio `puestos`) por el mismo motivo que `useHasApplied`: es
 * la única pantalla que la dispara, y así se evita el import cruzado hacia
 * `features/postulaciones`.
 */
export function useApplyToVacancy(vacancyId: string, studentProfileId: string | undefined) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => apiClient.post<VacancyApplication>("/vacancy-application", { vacancyId }),
    onSuccess: () => {
      // Misma queryKey que `useHasApplied` arriba y que `useMyApplications`
      // (features/postulaciones/hooks/use-my-applications.ts) — invalidar acá
      // alcanza para que las dos pantallas se actualicen solas.
      queryClient.invalidateQueries({ queryKey: ["postulaciones", "mias", studentProfileId] });
    },
  });

  const apiError = mutation.error instanceof ApiError ? mutation.error : null;

  return {
    apply: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.isError
      ? apiError?.status === 409
        ? "Ya te postulaste a esta vacante."
        : "No se pudo enviar la postulación. Intentá nuevamente."
      : null,
  };
}
