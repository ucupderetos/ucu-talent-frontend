"use client";

// Datos de "Mi perfil" (vista alumno): `StudentProfile` + `Education[]` +
// `WorkExperience[]`. Wire: `GET /student-profile/{id}` +
// `GET /education?studentProfileId={id}` +
// `GET /work-experience?studentProfileId={id}` (docs/ENDPOINTS.md, secciones
// 3 y 4) — no hay un único endpoint que devuelva las tres resueltas, se
// piden en paralelo.

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import type { StudentProfileData } from "@/features/perfil/types";
import type { Education, StudentProfile, WorkExperience } from "@/types";

/** @public para invalidación puntual futura (`docs/agents/data-fetching.md`). */
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

async function fetchStudentProfile(studentProfileId: string): Promise<StudentProfileData> {
  const [profile, education, workExperience] = await Promise.all([
    apiClient.get<StudentProfile>(`/student-profile/${studentProfileId}`),
    apiClient.get<Education[]>("/education", { params: { studentProfileId } }),
    apiClient.get<WorkExperience[]>("/work-experience", { params: { studentProfileId } }),
  ]);

  return { profile, education, workExperience };
}
