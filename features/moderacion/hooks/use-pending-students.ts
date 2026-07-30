"use client";

// trae los alumnos pendientes de aprobar, mismo criterio que empresas.
//
// base = User (PENDIENTE, rol ALUMNO), no StudentProfile: un alumno puede
// haber completado el paso 1 del registro (POST /user) y nunca el paso 2
// (POST /student-profile) — antes esa cuenta desaparecia de la cola entera.
// Ahora se muestra igual, con los campos del perfil vacios.

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

  const profilesById = new Map(profiles.map((p) => [p.studentProfileId, p]));
  const rows = pendingUsers.map((user) => toRow(user, profilesById.get(user.userId)));
  const filtered = filterRows(rows, filters);

  const start = (page - 1) * perPage;
  const items = filtered.slice(start, start + perPage);

  return { items, total: filtered.length, page, perPage };
}

function toRow(user: User, profile: StudentProfile | undefined): PendingStudentRow {
  return {
    studentProfileId: user.userId,
    name: profile?.name ?? "",
    surname: profile?.surname ?? "",
    documentType: profile?.documentType ?? null,
    documentNumber: profile?.documentNumber ?? "",
    phoneNumber: profile?.phoneNumber ?? null,
    linkedinUrl: profile?.linkedinUrl ?? null,
    skills: profile?.skills ?? [],
    description: profile?.description ?? null,
    status: user.status,
    reviewedAt: profile?.reviewedAt ?? null,
    adminComment: profile?.adminComment ?? null,
    cvFile: profile?.cvFile ?? null,
    hasProfile: profile !== undefined,
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
