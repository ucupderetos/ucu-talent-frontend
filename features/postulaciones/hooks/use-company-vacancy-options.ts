"use client";

// Opciones del filtro de oferta en "Postulantes": todas las ofertas de la
// empresa, sin aplicar los filtros activos (mismo criterio que
// `features/puestos/hooks/use-company-vacancies.ts`).
//
// ⚠️ ANDAMIO TEMPORAL sobre fixtures — ver use-company-applicants.ts. Va por
// `useQuery` igual que el resto del dominio: la lista de ofertas de la empresa
// es dato de servidor (`GET /vacancy?companyId=`), así la forma ya queda lista
// para el swap al backend.

import { useQuery } from "@tanstack/react-query";

import { MOCK_VACANCIES } from "@/lib/fixtures";

interface VacancyOption {
  value: string;
  label: string;
}

export function companyVacancyOptionsQueryKey(companyId: string | undefined) {
  return ["postulantes", "empresa", companyId, "opciones-oferta"] as const;
}

export function useCompanyVacancyOptions(companyId: string | undefined): VacancyOption[] {
  const { data } = useQuery({
    queryKey: companyVacancyOptionsQueryKey(companyId),
    queryFn: () =>
      MOCK_VACANCIES.filter((v) => v.companyId === companyId).map((v) => ({
        value: v.vacancyId,
        label: v.name,
      })),
    enabled: Boolean(companyId),
  });

  return data ?? [];
}
