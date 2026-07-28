"use client";

// Datos de la tabla de "Usuarios" (alumnos, vista admin — RF-MOD-05).
//
// 🔴 No hay endpoint real todavía (ver aviso en features/moderacion/types.ts).
// Esto simula un GET paginado y filtrado, pero resuelve todo en memoria sobre
// lib/fixtures.ts. Cuando exista el contrato, fetchStudents() pasa a llamar a
// apiClient.get<Paginated<StudentRow>>(...) con `filters` como query params, y
// se borra el filtrado/orden/paginación de acá abajo — el resto (la forma del
// hook, `StudentRow`) no cambia.

import { useQuery } from "@tanstack/react-query";

import {
  MOCK_AREAS,
  MOCK_DEGREES,
  MOCK_EDUCATION,
  MOCK_STUDENT_PROFILES,
  MOCK_STUDENT_USERS,
} from "@/lib/fixtures";
import type { StudentFilters, StudentRow } from "@/features/moderacion/types";
import type { Paginated } from "@/types";

const DEFAULT_PER_PAGE = 10;

export function studentsQueryKey(filters: StudentFilters) {
  return ["moderacion", "alumnos", filters] as const;
}

export function useStudents(filters: StudentFilters) {
  return useQuery({
    queryKey: studentsQueryKey(filters),
    queryFn: () => fetchStudents(filters),
  });
}

export function studentFilterOptionsQueryKey() {
  return ["moderacion", "alumnos", "opciones-filtros"] as const;
}

/** Solo ofrece carreras y áreas presentes en la educación de los alumnos. */
export function useStudentFilterOptions() {
  return useQuery({
    queryKey: studentFilterOptionsQueryKey(),
    queryFn: fetchStudentFilterOptions,
  });
}

async function fetchStudentFilterOptions() {
  const degreeIds = new Set(MOCK_EDUCATION.map((education) => education.degreeId));
  const degrees = MOCK_DEGREES.filter((degree) => degreeIds.has(degree.degreeId));
  const areaIds = new Set(degrees.map((degree) => degree.areaId));
  const areas = MOCK_AREAS.filter((area) => areaIds.has(area.areaId));

  return { degrees, areas };
}

async function fetchStudents(filters: StudentFilters): Promise<Paginated<StudentRow>> {
  const page = filters.page ?? 1;
  const perPage = filters.perPage ?? DEFAULT_PER_PAGE;

  const rows = MOCK_STUDENT_USERS.map(toRow).filter((row): row is StudentRow => row !== null);
  const filtered = filterRows(rows, filters);

  const start = (page - 1) * perPage;
  const items = filtered.slice(start, start + perPage);

  return { items, total: filtered.length, page, perPage };
}

/** Un alumno puede tener N educaciones (types/index.ts); tomamos la primera,
 *  que alcanza para esta tabla. `null` si el perfil no existe (no debería
 *  pasar con la PK compartida, pero el tipo de `find` lo permite). */
function toRow(user: (typeof MOCK_STUDENT_USERS)[number]): StudentRow | null {
  const profile = MOCK_STUDENT_PROFILES.find((p) => p.studentProfileId === user.userId);
  if (!profile) return null;

  const education = MOCK_EDUCATION.find((e) => e.studentProfileId === profile.studentProfileId);
  const degree = MOCK_DEGREES.find((d) => d.degreeId === education?.degreeId);
  const area = MOCK_AREAS.find((a) => a.areaId === degree?.areaId);

  return {
    ...profile,
    email: user.email,
    status: user.status,
    registeredAt: user.registeredAt,
    degreeId: degree?.degreeId ?? null,
    degreeName: degree?.name ?? "—",
    areaId: area?.areaId ?? null,
    areaName: area?.name ?? "—",
  };
}

function filterRows(rows: StudentRow[], filters: StudentFilters): StudentRow[] {
  const search = filters.search?.trim().toLowerCase();

  return rows.filter((row) => {
    if (filters.degreeIds?.length && (!row.degreeId || !filters.degreeIds.includes(row.degreeId)))
      return false;
    if (filters.areaIds?.length && (!row.areaId || !filters.areaIds.includes(row.areaId)))
      return false;
    if (search) {
      const normalizedSearch = search.replace(/\D/g, "");
      const matchesText = `${row.name} ${row.surname} ${row.email}`.toLowerCase().includes(search);
      const matchesDocument =
        normalizedSearch !== "" && row.documentNumber.includes(normalizedSearch);
      if (!matchesText && !matchesDocument) return false;
    }
    return true;
  });
}
