"use client";

// Detalle de un alumno para el Admin UCU.
//
// 🔴 Todavía no hay un endpoint administrativo confirmado que entregue en una
// sola lectura User + StudentProfile + Education + WorkExperience. La tabla de
// alumnos ya trabaja sobre fixtures por la misma razón. Este hook conserva la
// frontera de TanStack Query para que, cuando exista el contrato, solo cambie
// `fetchAdminStudentDetail` y el componente siga consumiendo la misma forma.

import { useQuery } from "@tanstack/react-query";

import type { AdminStudentDetail } from "@/features/moderacion/types";
import {
  MOCK_AREAS,
  MOCK_APPLICANT_USERS,
  MOCK_DEGREES,
  MOCK_EDUCATION,
  MOCK_PENDING_STUDENT_USERS,
  MOCK_STUDENT_PROFILES,
  MOCK_STUDENT_USERS,
  MOCK_WORK_EXPERIENCE,
} from "@/lib/fixtures";

export function adminStudentDetailQueryKey(studentProfileId: string) {
  return ["moderacion", "alumnos", "detalle", studentProfileId] as const;
}

export function useAdminStudentDetail(studentProfileId: string) {
  return useQuery({
    queryKey: adminStudentDetailQueryKey(studentProfileId),
    queryFn: () => fetchAdminStudentDetail(studentProfileId),
    enabled: Boolean(studentProfileId),
  });
}

async function fetchAdminStudentDetail(
  studentProfileId: string,
): Promise<AdminStudentDetail | null> {
  const user =
    MOCK_STUDENT_USERS.find(({ userId }) => userId === studentProfileId) ??
    MOCK_PENDING_STUDENT_USERS.find(({ userId }) => userId === studentProfileId) ??
    MOCK_APPLICANT_USERS.find(({ userId }) => userId === studentProfileId);
  const profile = MOCK_STUDENT_PROFILES.find(
    ({ studentProfileId: id }) => id === studentProfileId,
  );

  if (!user || !profile) return null;

  const education = MOCK_EDUCATION.filter(
    ({ studentProfileId: id }) => id === studentProfileId,
  ).map((item) => {
    const degree = MOCK_DEGREES.find(({ degreeId }) => degreeId === item.degreeId) ?? null;
    const area = degree
      ? (MOCK_AREAS.find(({ areaId }) => areaId === degree.areaId) ?? null)
      : null;

    return { ...item, degree, area };
  });

  const workExperience = MOCK_WORK_EXPERIENCE.filter(
    ({ studentProfileId: id }) => id === studentProfileId,
  ).map((item) => ({ ...item }));

  // Las mutaciones temporales escriben sobre los fixtures. El detalle devuelve
  // copias para que el cache no comparta esas referencias mutables y Query
  // pueda detectar el cambio de estado después de invalidar.
  return {
    user: { ...user },
    profile: { ...profile, skills: [...profile.skills] },
    education,
    workExperience,
  };
}
