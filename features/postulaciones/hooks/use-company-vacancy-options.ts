"use client";

// Opciones del filtro de oferta en "Postulantes": todas las ofertas de la
// empresa, sin aplicar los filtros activos (mismo criterio que
// `features/puestos/hooks/use-company-vacancies.ts`). Reusa el fetch de
// vacantes propias de `use-company-applicants.ts` (mismo dominio, mismo
// `GET /vacancy` sin paginar + filtro por `companyId`).

import { useQuery } from "@tanstack/react-query";

import { fetchCompanyVacancies } from "@/features/postulaciones/hooks/use-company-applicants";

interface VacancyOption {
  value: string;
  label: string;
}

/** @public para invalidación puntual futura (`docs/agents/data-fetching.md`). */
export function companyVacancyOptionsQueryKey(companyId: string | undefined) {
  return ["postulantes", "empresa", companyId, "opciones-oferta"] as const;
}

export function useCompanyVacancyOptions(companyId: string | undefined): VacancyOption[] {
  const { data } = useQuery({
    queryKey: companyVacancyOptionsQueryKey(companyId),
    queryFn: ({ signal }) => fetchVacancyOptions(companyId as string, signal),
    enabled: Boolean(companyId),
  });

  return data ?? [];
}

async function fetchVacancyOptions(
  companyId: string,
  signal?: AbortSignal,
): Promise<VacancyOption[]> {
  const vacancies = await fetchCompanyVacancies(companyId, signal);
  return vacancies.map((vacancy) => ({ value: vacancy.vacancyId, label: vacancy.name }));
}
