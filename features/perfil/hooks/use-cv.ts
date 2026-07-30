"use client";

// Subir, reemplazar y borrar el CV propio. Solo aplica al alumno: el CV vive en
// `StudentProfile`, no en `User` (a diferencia de la foto de perfil, que la
// tienen los tres roles).
//
// La LECTURA (canjear la key por una URL firmada) no está acá: vive en
// `hooks/use-cv.ts`, porque también la consume `postulaciones` cuando la empresa
// mira a un postulante. Mismo reparto que la foto de perfil.
//
// Wire — verificado contra el código fuente del backend
// (`StudentProfileController`/`StudentProfileServiceImpl`, rama `dev`), no
// contra ninguna versión de ENDPOINTS.md:
//
//   PATCH  /student-profile/cv   multipart, @RequestPart("file") → StudentProfileResponse
//   DELETE /student-profile/cv                                   → 204
//
// Los dos operan sobre el alumno del token (`jwt.getSubject()`): no reciben id,
// así que no hay forma de tocar el CV de otro. El `PATCH` **reemplaza**: sube el
// nuevo, lo guarda y recién entonces borra el viejo del storage, con rollback si
// algo falla en el medio. O sea que "cambiar el CV" es este mismo PATCH, no un
// DELETE + PATCH.

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ApiError, apiClient } from "@/lib/api-client";
import { studentProfileQueryKey } from "@/features/perfil/hooks/use-student-profile";
import type { StudentProfile } from "@/types";

/** Único tipo que acepta el backend (`ALLOWED_CV_CONTENT_TYPES`, un `Set.of`
 *  con un solo elemento). Se usa también como `accept` del input, para que el
 *  explorador de archivos no ofrezca lo que va a terminar en un 400. */
export const CV_ACCEPTED_TYPES = ["application/pdf"] as const;

/** El backend NO valida tamaño (`validateCvFile` solo mira que no esté vacío y
 *  que el content type sea PDF) — queda el límite de multipart de Spring. Este
 *  techo es del front, mismo criterio que la foto de perfil: un CV no necesita
 *  más, y evita morir contra un límite del servidor con un error menos claro. */
export const CV_MAX_BYTES = 5 * 1024 * 1024;

/**
 * Valida el archivo antes de gastar una request. Devuelve el mensaje de error
 * listo para mostrar, o `null` si está bien.
 */
export function validateCv(file: File): string | null {
  if (!(CV_ACCEPTED_TYPES as readonly string[]).includes(file.type)) {
    return "El CV tiene que ser un PDF.";
  }
  if (file.size > CV_MAX_BYTES) {
    return "El CV no puede pesar más de 5 MB.";
  }
  return null;
}

export function useUpdateCv(studentProfileId: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (file: File) => {
      const body = new FormData();
      // El nombre del campo es `file` — confirmado contra el
      // `@RequestPart("file")` del controller, no adivinado del endpoint de la
      // foto (que usa el mismo nombre pero es otro controller).
      body.append("file", file);
      return apiClient.patch<StudentProfile>("/student-profile/cv", body);
    },
    // Se invalida en vez de escribir el response en el cache: la key de perfil
    // (`studentProfileQueryKey`) guarda las TRES cosas de la pantalla (perfil +
    // education + workExperience), y el PATCH solo devuelve el perfil.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentProfileQueryKey(studentProfileId) });
    },
  });

  return {
    updateCv: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: errorMessage(mutation.error, "No se pudo subir el CV. Intentá nuevamente."),
  };
}

export function useDeleteCv(studentProfileId: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => apiClient.del<void>("/student-profile/cv"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentProfileQueryKey(studentProfileId) });
    },
  });

  return {
    deleteCv: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: errorMessage(mutation.error, "No se pudo eliminar el CV. Intentá nuevamente."),
  };
}

/** Prioriza el `detail` real del backend (A-19) sobre el mensaje genérico —
 *  mismo criterio que `use-profile-image.ts`. */
function errorMessage(error: Error | null, fallback: string): string | null {
  if (error instanceof ApiError) return error.message;
  return error ? fallback : null;
}
