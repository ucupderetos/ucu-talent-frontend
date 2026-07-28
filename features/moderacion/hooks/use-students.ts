"use client";

// tabla de "Usuarios" (alumnos, vista admin — RF-MOD-05).
//
// GET /user?role=ALUMNO trae todos los estados (a diferencia de la cola de
// pendientes, aca mostramos tambien aprobados y rechazados) + GET
// /student-profile, cruzados por pk. la carrera/area de cada fila sale de
// GET /education?studentProfileId=, y ese no tiene version "traeme todos de
// una", asi que es un request por alumno. no es lo mas optimo pero para el
// tamaño de datos que manejamos por ahora funciona bien.

import { useQuery } from "@tanstack/react-query";

import { ApiError, apiClient } from "@/lib/api-client";
import type { StudentFilters, StudentRow } from "@/features/moderacion/types";
import type { Area, Degree, Education, Paginated, StudentProfile, User } from "@/types";

const DEFAULT_PER_PAGE = 10;

/** @public para invalidación puntual futura (AGENTS.md). */
export function studentsQueryKey(filters: StudentFilters) {
  return ["moderacion", "alumnos", filters] as const;
}

export function useStudents(filters: StudentFilters) {
  return useQuery({
    queryKey: studentsQueryKey(filters),
    queryFn: () => fetchStudents(filters),
  });
}

async function fetchStudents(filters: StudentFilters): Promise<Paginated<StudentRow>> {
  const page = filters.page ?? 1;
  const perPage = filters.perPage ?? DEFAULT_PER_PAGE;

  const [users, profiles, degrees, areas] = await Promise.all([
    apiClient.get<User[]>("/user", { params: { role: "ALUMNO" } }),
    apiClient.get<StudentProfile[]>("/student-profile"),
    apiClient.get<Degree[]>("/degree"),
    apiClient.get<Area[]>("/area"),
  ]);

  const usersById = new Map(users.map((u) => [u.userId, u]));
  const degreesById = new Map(degrees.map((d) => [d.degreeId, d]));
  const areasById = new Map(areas.map((a) => [a.areaId, a]));

  const rows = await Promise.all(
    profiles
      .filter((p) => usersById.has(p.studentProfileId))
      .map((p) => toRow(p, usersById.get(p.studentProfileId)!, degreesById, areasById)),
  );
  const filtered = filterRows(rows, filters);

  const start = (page - 1) * perPage;
  const items = filtered.slice(start, start + perPage);

  return { items, total: filtered.length, page, perPage };
}

/** un alumno puede tener varias educaciones cargadas, para esta tabla nos
 *  alcanza con mostrar la primera. */
async function toRow(
  profile: StudentProfile,
  user: User,
  degreesById: Map<string, Degree>,
  areasById: Map<string, Area>,
): Promise<StudentRow> {
  const education = await fetchEducation(profile.studentProfileId);
  const degree = education[0] ? degreesById.get(education[0].degreeId) : undefined;
  const area = degree ? areasById.get(degree.areaId) : undefined;

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

/** si tira 404 es que el alumno todavia no cargo ninguna educacion, la fila
 *  sigue siendo valida, solo que sin carrera/area para mostrar. */
async function fetchEducation(studentProfileId: string): Promise<Education[]> {
  try {
    return await apiClient.get<Education[]>("/education", {
      params: { studentProfileId },
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return [];
    throw error;
  }
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

/** opciones de los multiselect: el catalogo completo de carreras/areas, sin
 *  filtrar. tiene su propia query key (no depende de los filtros) para no
 *  volver a pedirlo cada vez que cambia la busqueda o la pagina. */
export function useStudentFilterOptions(): { degrees: Degree[]; areas: Area[] } {
  const { data } = useQuery({
    queryKey: ["moderacion", "alumnos-filtros"],
    queryFn: async () => {
      const [degrees, areas] = await Promise.all([
        apiClient.get<Degree[]>("/degree"),
        apiClient.get<Area[]>("/area"),
      ]);
      return { degrees, areas };
    },
  });

  return data ?? { degrees: [], areas: [] };
}
