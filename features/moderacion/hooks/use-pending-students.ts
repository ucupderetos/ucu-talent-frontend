"use client";

// trae los alumnos pendientes de aprobar, mismo criterio que empresas.
//
// GET /student-profile (ADMIN) devuelve todos los perfiles con el status ya
// adentro. cruzamos con GET /user?status=PENDIENTE&role=ALUMNO por la pk
// compartida (studentProfileId === userId) para sacar email y fecha de
// registro. ojo que AGENTS.md decia que el alumno nacia APROBADO directo
// (A-01) pero probado en vivo el 28/7 el alumno SI nace PENDIENTE y se pudo
// aprobar bien — parece que ya lo corrigieron del lado del back, falta
// avisarle al equipo para que actualicen el doc.

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import type { PendingStudentRow, PendingStudentsFilters } from "@/features/moderacion/types";
import type { Paginated, StudentProfile, User } from "@/types";

const DEFAULT_PER_PAGE = 10;

/** @public para invalidación puntual futura (AGENTS.md). */
export function pendingStudentsQueryKey(filters: PendingStudentsFilters) {
  return ["moderacion", "alumnos-pendientes", filters] as const;
}

export function usePendingStudents(filters: PendingStudentsFilters) {
  return useQuery({
    queryKey: pendingStudentsQueryKey(filters),
    queryFn: () => fetchPendingStudents(filters),
  });
}

async function fetchPendingStudents(
  filters: PendingStudentsFilters,
): Promise<Paginated<PendingStudentRow>> {
  const page = filters.page ?? 1;
  const perPage = filters.perPage ?? DEFAULT_PER_PAGE;

  const [pendingUsers, profiles] = await Promise.all([
    apiClient.get<User[]>("/user", { params: { status: "PENDIENTE", role: "ALUMNO" } }),
    apiClient.get<StudentProfile[]>("/student-profile"),
  ]);

  const pendingUsersById = new Map(pendingUsers.map((u) => [u.userId, u]));
  const rows = profiles
    .filter((p) => p.status === "PENDIENTE" && pendingUsersById.has(p.studentProfileId))
    .map((p) => toRow(p, pendingUsersById.get(p.studentProfileId)!));
  const filtered = filterRows(rows, filters);

  const start = (page - 1) * perPage;
  const items = filtered.slice(start, start + perPage);

  return { items, total: filtered.length, page, perPage };
}

function toRow(profile: StudentProfile, user: User): PendingStudentRow {
  return {
    ...profile,
    email: user.email,
    registeredAt: user.registeredAt,
  };
}

function filterRows(
  rows: PendingStudentRow[],
  filters: PendingStudentsFilters,
): PendingStudentRow[] {
  const search = filters.search?.trim().toLowerCase();
  if (!search) return rows;

  const normalizedSearch = search.replace(/\D/g, "");

  return rows.filter((row) => {
    const matchesText = `${row.name} ${row.surname} ${row.email}`.toLowerCase().includes(search);
    const matchesDocument =
      normalizedSearch !== "" && row.documentNumber.includes(normalizedSearch);
    return matchesText || matchesDocument;
  });
}
