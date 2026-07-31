"use client";

// Postulaciones del alumno logueado (vista "Mis postulaciones") — RF-POS.
//
// `GET /vacancy-application/me/detailed` ya resuelve todo lo que la card
// necesita en una sola llamada (application + vacancy + companyName +
// areaName) — reemplaza al `GET /vacancy-application/me` + `GET /vacancy` +
// `GET /company` + `GET /area` de antes (mismo N+1 que ya se corrigió en
// "Mis ofertas", ver A-22 en docs/agents/open-questions.md). No documentado
// en la copia local de `ENDPOINTS.md` — DTO específico para esta pantalla,
// agregado 2026-07-30 y confirmado contra el `ENDPOINTS.md` del repo de
// backend (ver A-26 en docs/agents/open-questions.md).
//
// ⚠️ `application.status` es del ENUM DTO (VacancyApplicationStatus), no
// confundir con `application.vacancyStatus`, el estado de la vacante en el
// momento de la postulación.

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
// Los tipos del wire viven en `types.ts` del dominio, no acá: son la forma de
// un endpoint, no un detalle de este hook.
import type {
  MyApplicationRow,
  VacancyApplicationDetailedResponse,
} from "@/features/postulaciones/types";
import type { Area, VacancyApplication } from "@/types";

/**
 * @public para invalidación puntual futura (`docs/agents/data-fetching.md`). Misma queryKey que
 * usa `useHasApplied` (features/puestos/hooks/use-vacancy.ts) — deliberado,
 * ver el comentario ahí sobre por qué no es un import cruzado entre
 * `features/`.
 */
export function myApplicationsQueryKey(studentProfileId: string | undefined) {
  return ["postulaciones", "mias", studentProfileId] as const;
}

export function useMyApplications(studentProfileId: string | undefined) {
  return useQuery({
    queryKey: myApplicationsQueryKey(studentProfileId),
    queryFn: () => fetchMyApplications(studentProfileId as string),
    enabled: studentProfileId != null,
  });
}

async function fetchMyApplications(studentProfileId: string): Promise<MyApplicationRow[]> {
  const items = await apiClient.get<VacancyApplicationDetailedResponse[]>(
    "/vacancy-application/me/detailed",
  );

  const rows = items.map((item) => toRow(item, studentProfileId));

  return sortByRecent(rows);
}

function toRow(
  item: VacancyApplicationDetailedResponse,
  studentProfileId: string,
): MyApplicationRow {
  const application: VacancyApplication = {
    vacancyApplicationId: item.application.vacancyApplicationId,
    vacancyId: item.application.vacancyId,
    studentProfileId,
    status: item.application.status,
    appliedAt: item.application.appliedAt,
    // Ver el comentario de arriba: `GET /vacancy-application/me/detailed`
    // tampoco expone `accepted` al alumno. Hardcodeado en `false`: ninguna
    // pantalla de este dominio lo lee para decidir nada, es solo para
    // satisfacer el tipo compartido.
    accepted: false,
  };

  return {
    application,
    vacancy: item.vacancy,
    companyName: item.companyName,
    areaName: item.areaName,
  };
}

function sortByRecent(rows: MyApplicationRow[]): MyApplicationRow[] {
  return [...rows].sort(
    (a, b) =>
      new Date(b.application.appliedAt).getTime() - new Date(a.application.appliedAt).getTime(),
  );
}

/**
 * Opciones del select de carrera para el popover de filtros: solo las áreas
 * de vacantes a las que el alumno realmente se postuló (sin aplicar los
 * filtros activos), mismo criterio que `useFeedFilterOptions` en
 * `use-feed-vacancies.ts`. Se arma a partir de las filas ya resueltas (no
 * pide `GET /area` de nuevo) — el filtro solo necesita id + nombre.
 */
export function useMyApplicationAreas(
  rows: MyApplicationRow[] | undefined,
): Pick<Area, "areaId" | "name">[] {
  return useMemo(() => {
    if (!rows) return [];
    const seen = new Map<string, string>();
    for (const row of rows) {
      if (!seen.has(row.vacancy.areaId)) seen.set(row.vacancy.areaId, row.areaName);
    }
    return Array.from(seen, ([areaId, name]) => ({ areaId, name }));
  }, [rows]);
}
