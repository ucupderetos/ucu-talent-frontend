"use client";

// trae los alumnos pendientes (cedula no encontrada en el padron). por ahora
// junta todo en memoria sobre lib/fixtures.ts, cuando haya back se cambia
// fetchPendingStudents por el fetch real y listo.

import { useQuery } from "@tanstack/react-query";

import { MOCK_PENDING_STUDENT_USERS, MOCK_STUDENT_PROFILES } from "@/lib/fixtures";
import type { PendingStudentRow, PendingStudentsFilters } from "@/features/moderacion/types";
import type { Paginated } from "@/types";

const DEFAULT_PER_PAGE = 10;

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

  // solo los alumnos cuyo user sigue PENDIENTE — al aprobar/rechazar
  // (use-review-account.ts) el status cambia y salen de la cola.
  const rows = MOCK_PENDING_STUDENT_USERS.filter((u) => u.status === "PENDIENTE")
    .map(toRow)
    .filter((row): row is PendingStudentRow => row !== null);
  const filtered = filterRows(rows, filters);

  const start = (page - 1) * perPage;
  const items = filtered.slice(start, start + perPage);

  return { items, total: filtered.length, page, perPage };
}

function toRow(user: (typeof MOCK_PENDING_STUDENT_USERS)[number]): PendingStudentRow | null {
  const profile = MOCK_STUDENT_PROFILES.find((p) => p.studentProfileId === user.userId);
  if (!profile) return null;

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
