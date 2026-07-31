"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ApiError, apiClient } from "@/lib/api-client";
import { studentProfileQueryKey } from "@/features/perfil/hooks/use-student-profile";
import type { UpdateStudentProfileInput } from "@/features/perfil/types";
import type { StudentProfile } from "@/types";

/**
 * Guardado del perfil de alumno desde "Información personal" y "Habilidades"
 * en Mi perfil. Wire: `PUT /student-profile/{id}`, body
 * `UpdateStudentProfileRequest` (docs/ENDPOINTS.md, sección 3):
 * `{ phoneNumber, linkedinUrl, skills, description }` — reemplaza el objeto
 * entero, no es un patch parcial (mismo criterio que `PUT /vacancy/{id}`), y
 * el backend exige los cuatro no vacíos en cada request. Las dos pestañas
 * editan este mismo recurso (skills en una, el resto en la otra) pero
 * comparten un borrador para poder mandar SIEMPRE los cuatro campos — ver
 * `StudentProfileDraft` en features/perfil/types.ts. `name`/`surname`/documento
 * NO viajan acá — el contrato es explícito en que no se modifican desde este
 * endpoint.
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
    // Antes era un string fijo que tapaba el `detail` real del backend (ej.
    // "La descripción es obligatoria..." — A-19) con un genérico sin
    // información, justo el caso donde más hacía falta el mensaje real
    // (encontrado en QA manual).
    error: mutation.error instanceof ApiError
      ? mutation.error.message
      : mutation.isError
        ? "No se pudo guardar el perfil. Intentá nuevamente."
        : null,
  };
}
