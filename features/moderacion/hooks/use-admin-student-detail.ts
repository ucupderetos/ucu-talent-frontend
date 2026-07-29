"use client";

// detalle de un alumno para el admin.
//
// como studentProfileId y userId son la misma pk, pegamos GET /user/{id} y
// GET /student-profile/{id} con el mismo id. education y work-experience
// salen por su propio endpoint filtrando por studentProfileId, y para
// resolver carrera/area de la educacion usamos el catalogo completo de
// degree/area (son listas chicas, no vale la pena pedirlas una por area).

import { useQuery } from "@tanstack/react-query";

import { ApiError, apiClient } from "@/lib/api-client";
import type { AdminStudentDetail, AdminStudentEducation } from "@/features/moderacion/types";
import type { Area, Degree, Education, StudentProfile, User, WorkExperience } from "@/types";

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
  let user: User;
  let profile: StudentProfile;
  try {
    [user, profile] = await Promise.all([
      apiClient.get<User>(`/user/${studentProfileId}`),
      apiClient.get<StudentProfile>(`/student-profile/${studentProfileId}`),
    ]);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }

  const [educationRecords, workExperience, degrees, areas] = await Promise.all([
    fetchEducation(studentProfileId),
    fetchWorkExperience(studentProfileId),
    apiClient.get<Degree[]>("/degree"),
    apiClient.get<Area[]>("/area"),
  ]);

  const degreesById = new Map(degrees.map((d) => [d.degreeId, d]));
  const areasById = new Map(areas.map((a) => [a.areaId, a]));

  const education: AdminStudentEducation[] = educationRecords.map((item) => {
    const degree = degreesById.get(item.degreeId) ?? null;
    const area = degree ? (areasById.get(degree.areaId) ?? null) : null;
    return { ...item, degree, area };
  });

  return { user, profile, education, workExperience };
}

/** 404 (o lista vacia) = el alumno todavia no cargo educacion: la seccion
 *  queda vacia sin romper el detalle. Otros errores SI se propagan — el detalle
 *  es de un solo alumno, no conviene ocultarlos (a diferencia de la tabla,
 *  `use-students.ts`, que degrada cualquier error para no caerse por una fila). */
async function fetchEducation(studentProfileId: string): Promise<Education[]> {
  try {
    return await apiClient.get<Education[]>("/education", { params: { studentProfileId } });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return [];
    throw error;
  }
}

/** Mismo criterio que `fetchEducation`: 404 (o lista vacia) = el alumno no
 *  cargo experiencia — la seccion queda vacia sin romper el detalle. Antes esta
 *  llamada no tenia manejo de 404 y un alumno sin experiencia podia tumbar todo
 *  el detalle. */
async function fetchWorkExperience(studentProfileId: string): Promise<WorkExperience[]> {
  try {
    return await apiClient.get<WorkExperience[]>("/work-experience", { params: { studentProfileId } });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return [];
    throw error;
  }
}
