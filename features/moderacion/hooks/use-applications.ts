"use client";

// Datos de la tabla de "Postulaciones" (vista admin).
//
// 🔴 No hay endpoint real todavía (ver aviso en features/moderacion/types.ts).
// Esto simula un GET paginado y filtrado, pero resuelve todo en memoria sobre
// lib/fixtures.ts. Cuando exista el contrato, fetchApplications() pasa a
// llamar a apiClient.get<Paginated<AdminApplicationRow>>(...) con `filters`
// como query params — el resto (la forma del hook, `AdminApplicationRow`) no
// cambia.

import { useQuery } from "@tanstack/react-query";

import {
  MOCK_APPLICATIONS,
  MOCK_COMPANIES,
  MOCK_STUDENT_PROFILES,
  MOCK_STUDENT_USERS,
  MOCK_USERS,
  MOCK_VACANCIES,
} from "@/lib/fixtures";
import type {
  AdminApplicationFilters,
  AdminApplicationOrder,
  AdminApplicationRow,
} from "@/features/moderacion/types";
import type { Paginated, User } from "@/types";

const DEFAULT_PER_PAGE = 10;

export function applicationsQueryKey(filters: AdminApplicationFilters) {
  return ["moderacion", "postulaciones", filters] as const;
}

export function useApplications(filters: AdminApplicationFilters) {
  return useQuery({
    queryKey: applicationsQueryKey(filters),
    queryFn: () => fetchApplications(filters),
  });
}

async function fetchApplications(
  filters: AdminApplicationFilters,
): Promise<Paginated<AdminApplicationRow>> {
  const page = filters.page ?? 1;
  const perPage = filters.perPage ?? DEFAULT_PER_PAGE;

  const rows = MOCK_APPLICATIONS.map(toRow).filter(
    (row): row is AdminApplicationRow => row !== null,
  );
  const filtered = filterRows(rows, filters);
  const sorted = sortRows(filtered, filters.order);

  const start = (page - 1) * perPage;
  const items = sorted.slice(start, start + perPage);

  return { items, total: sorted.length, page, perPage };
}

/** Todos los `User` con sesión de prueba: el único `ALUMNO` de `MOCK_USERS`
 *  más los que solo tienen perfil (`MOCK_STUDENT_USERS`, ver fixtures.ts). */
function allStudentUsers(): User[] {
  return [MOCK_USERS.ALUMNO, ...MOCK_STUDENT_USERS];
}

/** `null` si falta algún dato relacionado (no debería pasar con la PK
 *  compartida, pero el tipo de `find` lo permite). */
function toRow(application: (typeof MOCK_APPLICATIONS)[number]): AdminApplicationRow | null {
  const profile = MOCK_STUDENT_PROFILES.find(
    (p) => p.studentProfileId === application.studentProfileId,
  );
  const user = allStudentUsers().find((u) => u.userId === application.studentProfileId);
  const vacancy = MOCK_VACANCIES.find((v) => v.vacancyId === application.vacancyId);
  const company = MOCK_COMPANIES.find((c) => c.companyId === vacancy?.companyId);
  if (!profile || !vacancy) return null;

  return {
    ...application,
    studentName: profile.name,
    studentSurname: profile.surname,
    studentEmail: user?.email ?? "—",
    vacancyName: vacancy.name,
    companyId: company?.companyId ?? null,
    companyName: company?.name ?? "—",
  };
}

function filterRows(
  rows: AdminApplicationRow[],
  filters: AdminApplicationFilters,
): AdminApplicationRow[] {
  const search = filters.search?.trim().toLowerCase();

  return rows.filter((row) => {
    if (filters.vacancyIds?.length && !filters.vacancyIds.includes(row.vacancyId)) return false;
    if (
      filters.companyIds?.length &&
      (!row.companyId || !filters.companyIds.includes(row.companyId))
    )
      return false;
    if (filters.statuses?.length && !filters.statuses.includes(row.status)) return false;
    if (search) {
      const haystack = `${row.studentName} ${row.studentSurname} ${row.studentEmail} ${row.vacancyName}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });
}

function sortRows(
  rows: AdminApplicationRow[],
  order: AdminApplicationOrder = "recent",
): AdminApplicationRow[] {
  const sorted = [...rows];
  const delta = (a: AdminApplicationRow, b: AdminApplicationRow) =>
    new Date(a.appliedAt).getTime() - new Date(b.appliedAt).getTime();

  return order === "oldest" ? sorted.sort(delta) : sorted.sort((a, b) => -delta(a, b));
}
