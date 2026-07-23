"use client";

// Opciones del filtro de oferta en "Postulantes": todas las ofertas de la
// empresa, sin aplicar los filtros activos (mismo criterio que
// `features/puestos/hooks/use-company-vacancies.ts`).
//
// ⚠️ ANDAMIO TEMPORAL sobre fixtures — ver use-company-applicants.ts.

import { useMemo } from "react";

import { MOCK_VACANCIES } from "@/lib/fixtures";

export function useCompanyVacancyOptions(companyId: string | undefined) {
  return useMemo(() => {
    return MOCK_VACANCIES.filter((v) => v.companyId === companyId).map((v) => ({
      value: v.vacancyId,
      label: v.name,
    }));
  }, [companyId]);
}
