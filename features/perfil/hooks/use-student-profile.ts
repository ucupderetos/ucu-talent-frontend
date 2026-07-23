"use client";

// Datos mock del perfil del alumno logueado ("Mi perfil") para desarrollo,
// mientras no exista GET /student-profile/{id} con Education/WorkExperience
// resueltas (AGENTS.md, A-08: tampoco hay PUT todavía, pero la lectura al
// menos ya tiene forma en docs/ENDPOINTS.md).
//
// TODO(api): cuando exista el contrato, fetchStudentProfile encadena
// GET /student-profile/{id} + GET /education?studentProfileId= +
// GET /work-experience?studentProfileId= (o lo que exponga el backend real)
// y se borra la búsqueda en fixtures.

import { useQuery } from "@tanstack/react-query";

import {
  MOCK_EDUCATION,
  MOCK_STUDENT_PROFILES,
  MOCK_WORK_EXPERIENCE,
} from "@/lib/fixtures";
import type { StudentProfileData } from "@/features/perfil/types";

export function studentProfileQueryKey(studentProfileId: string | undefined) {
  return ["perfil", "alumno", studentProfileId] as const;
}

export function useStudentProfile(studentProfileId: string | undefined) {
  return useQuery({
    queryKey: studentProfileQueryKey(studentProfileId),
    queryFn: () => fetchStudentProfile(studentProfileId as string),
    enabled: studentProfileId != null,
  });
}

async function fetchStudentProfile(studentProfileId: string): Promise<StudentProfileData | null> {
  const profile = MOCK_STUDENT_PROFILES.find((p) => p.studentProfileId === studentProfileId);
  if (!profile) return null;

  return {
    profile,
    education: MOCK_EDUCATION.filter((e) => e.studentProfileId === studentProfileId),
    workExperience: MOCK_WORK_EXPERIENCE.filter((w) => w.studentProfileId === studentProfileId),
  };
}
