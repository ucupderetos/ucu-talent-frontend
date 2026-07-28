"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import { studentProfileQueryKey } from "@/features/perfil/hooks/use-student-profile";
import type { UpdateStudentProfileInput } from "@/features/perfil/types";
import type { StudentProfile } from "@/types";

/**
 * Guardado de "Información personal" y "Habilidades" en Mi perfil.
 * Wire: `PUT /student-profile/{id}`, body `UpdateStudentProfileRequest`
 * (docs/ENDPOINTS.md, sección 3): `{ phoneNumber, linkedinUrl, skills,
 * description }` — reemplaza el objeto entero, no es un patch parcial (mismo
 * criterio que `PUT /vacancy/{id}`). Por eso las dos pestañas que editan este
 * recurso (`PersonalInfoTab`, `SkillsTab`) mandan SIEMPRE los cuatro campos:
 * los propios editados más los de la otra pestaña sin tocar, tomados de
 * `profile`. `name`/`surname`/documento NO viajan acá — el contrato es
 * explícito en que no se modifican desde este endpoint.
 */
function updateStudentProfileRequest(
  studentProfileId: string,
  payload: UpdateStudentProfileInput,
): Promise<StudentProfile> {
  return apiClient.put<StudentProfile>(`/student-profile/${studentProfileId}`, payload);
}

export function useUpdateStudentProfile(studentProfileId: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: UpdateStudentProfileInput) =>
      updateStudentProfileRequest(studentProfileId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentProfileQueryKey(studentProfileId) });
    },
  });

  return {
    updateProfile: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.isError ? "No se pudo guardar el perfil. Intentá nuevamente." : null,
  };
}
