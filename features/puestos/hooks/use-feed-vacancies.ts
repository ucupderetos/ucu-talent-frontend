"use client";

// Datos del feed de vacantes (vista alumno) — RF-14.
//
// GET /vacancy no pagina ni filtra en Backend (docs/ENDPOINTS.md, sección 5):
// Front trae la colección completa una sola vez y resuelve filtros, orden y
// paginación visual en el cliente. Por eso la data cruda se cachea sin los
// filtros en la queryKey — cambiar un filtro no dispara un nuevo fetch, solo
// re-deriva sobre los datos ya en cache.
//
// Solo muestra vacantes `PUBLICADO`: es el estado en el que la vacante nace y
// el único visible para el alumno (ver `VacancyStatus` en types/index.ts).
// `PENDIENTE` significa que el Admin la retiró para revisarla, así que
// mostrarla acá sería filtrar una vacante que no debería estar viva.

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import type { FeedFilters, FeedVacancyRow } from "@/features/puestos/types";
import type { Area, Company, ContractType, Vacancy } from "@/types";

/** @public para invalidación puntual futura (`docs/agents/data-fetching.md`). */
export function feedVacanciesQueryKey() {
  return ["puestos", "feed"] as const;
}

function useFeedVacanciesQuery() {
  return useQuery({
    queryKey: feedVacanciesQueryKey(),
    queryFn: fetchPublishedVacancies,
  });
}

export function useFeedVacancies(filters: FeedFilters) {
  const query = useFeedVacanciesQuery();

  const data = useMemo(() => {
    if (!query.data) return undefined;
    return sortByRecent(filterRows(query.data.rows, query.data.areas, filters));
  }, [query.data, filters]);

  return { ...query, data };
}

async function fetchPublishedVacancies(): Promise<{ rows: FeedVacancyRow[]; areas: Area[] }> {
  const [vacancies, areas, companies] = await Promise.all([
    apiClient.get<Vacancy[]>("/vacancy"),
    apiClient.get<Area[]>("/area"),
    apiClient.get<Company[]>("/company"),
  ]);

  const rows = vacancies
    .filter((vacancy) => vacancy.status === "PUBLICADO")
    .map((vacancy) => toRow(vacancy, areas, companies));

  return { rows, areas };
}

function toRow(vacancy: Vacancy, areas: Area[], companies: Company[]): FeedVacancyRow {
  const area = areas.find((a) => a.areaId === vacancy.areaId) ?? null;
  const parentArea = area?.parentAreaId
    ? (areas.find((a) => a.areaId === area.parentAreaId) ?? null)
    : null;

  return {
    ...vacancy,
    companyName: companies.find((c) => c.companyId === vacancy.companyId)?.name ?? "—",
    areaName: area?.name ?? "—",
    parentAreaName: parentArea?.name ?? null,
  };
}

function filterRows(
  rows: FeedVacancyRow[],
  areas: Area[],
  filters: FeedFilters,
): FeedVacancyRow[] {
  const search = filters.search?.trim().toLowerCase();
  const areaIds = filters.areaIds?.length ? expandWithSubareas(filters.areaIds, areas) : null;

  return rows.filter((row) => {
    if (areaIds && !areaIds.has(row.areaId)) return false;
    if (filters.contractTypes?.length && !filters.contractTypes.includes(row.contractType)) {
      return false;
    }
    if (search) {
      const haystack = `${row.name} ${row.description} ${row.companyName} ${row.areaName}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });
}

/**
 * "Al filtrar por área se consideran sus subáreas" (docs/ENDPOINTS.md,
 * sección 5): si se selecciona un área padre, las vacantes de sus áreas hijas
 * también matchean.
 */
function expandWithSubareas(selectedIds: string[], areas: Area[]): Set<string> {
  const expanded = new Set(selectedIds);
  let added = true;

  while (added) {
    added = false;
    for (const area of areas) {
      if (
        area.parentAreaId &&
        expanded.has(area.parentAreaId) &&
        !expanded.has(area.areaId)
      ) {
        expanded.add(area.areaId);
        added = true;
      }
    }
  }

  return expanded;
}

function sortByRecent(rows: FeedVacancyRow[]): FeedVacancyRow[] {
  return [...rows].sort((a, b) => publishedTimestamp(b) - publishedTimestamp(a));
}

/** `publicationDate` siempre está seteada — mismo criterio que la tabla de
 *  "Mis ofertas" del lado empresa, ver `use-company-vacancies.ts`. */
function publishedTimestamp(row: FeedVacancyRow): number {
  return new Date(row.publicationDate).getTime();
}

/**
 * Opciones de los selects de carrera/trabajo: se calculan sobre TODAS las
 * vacantes visibles (sin aplicar los filtros activos), para que el dropdown
 * no vaya perdiendo opciones a medida que se filtra — mismo criterio que
 * useCompanyVacancyFilterOptions en use-company-vacancies.ts.
 */
export function useFeedFilterOptions(): { areas: Area[]; contractTypes: ContractType[] } {
  const { data } = useFeedVacanciesQuery();

  return useMemo(() => {
    if (!data) return { areas: [], contractTypes: [] };

    const areaIds = new Set(data.rows.map((row) => row.areaId));
    const contractTypes = Array.from(new Set(data.rows.map((row) => row.contractType))).sort();

    return {
      areas: data.areas.filter((area) => areaIds.has(area.areaId)),
      contractTypes,
    };
  }, [data]);
}
