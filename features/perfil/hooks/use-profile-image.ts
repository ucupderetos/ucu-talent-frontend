"use client";

// Subir, reemplazar y borrar la foto de perfil propia. Aplica a los tres roles:
// la foto vive en `User`, no en el perfil del rol.
//
// Wire (verificado contra el codigo fuente del backend — ninguna version de
// docs/ENDPOINTS.md lo documenta):
//
//   PATCH  /user/profile/image   multipart, campo "file" → UserResponse
//   DELETE /user/profile/image                           → 204
//
// Los dos operan siempre sobre el usuario del token (`jwt.getSubject()`): no
// reciben un id, asi que no hay forma de tocar la foto de otro.
//
// El backend reemplaza, no acumula: si ya habia una foto, sube la nueva y recien
// entonces borra la vieja del storage (con rollback si la subida falla). O sea
// que "cambiar la foto" es este mismo PATCH, no un DELETE + PATCH.

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ApiError, apiClient } from "@/lib/api-client";
import { userQueryKey } from "@/hooks/use-profile-image";
import type { User } from "@/types";

/** Lo único que acepta el backend (`ALLOWED_PROFILE_IMAGE_TYPES`): ni webp ni
 *  gif. Se usa también como `accept` del input, para que el explorador de
 *  archivos no ofrezca lo que va a terminar en un 400. */
export const PROFILE_IMAGE_ACCEPTED_TYPES = ["image/jpeg", "image/png"] as const;

/** El backend NO valida tamaño (no hay límite en el service, solo el de
 *  multipart de Spring). Este techo es del front: una foto de perfil no
 *  necesita más, y evita que una subida enorme muera contra un límite del
 *  servidor con un error mucho menos claro. */
export const PROFILE_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

/**
 * Valida el archivo antes de gastar una request. Devuelve el mensaje de error
 * listo para mostrar, o `null` si está bien.
 */
export function validateProfileImage(file: File): string | null {
  if (!(PROFILE_IMAGE_ACCEPTED_TYPES as readonly string[]).includes(file.type)) {
    return "La imagen tiene que ser JPG o PNG.";
  }
  if (file.size > PROFILE_IMAGE_MAX_BYTES) {
    return "La imagen no puede pesar más de 5 MB.";
  }
  return null;
}

export function useUpdateProfileImage(userId: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (file: File) => {
      const body = new FormData();
      body.append("file", file);
      return apiClient.patch<User>("/user/profile/image", body);
    },
    onSuccess: (updated) => {
      // El PATCH ya devuelve el `User` con la key nueva: se escribe directo en
      // el cache para no pedir de nuevo `GET /user/{id}`. La URL firmada sí se
      // pide después, pero eso lo dispara solo `useSignedProfileImageUrl` al
      // ver una key distinta (la key es parte de su queryKey).
      queryClient.setQueryData(userQueryKey(userId), updated);
    },
  });

  return {
    updateImage: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: errorMessage(mutation.error, "No se pudo actualizar la imagen. Intentá nuevamente."),
  };
}

export function useDeleteProfileImage(userId: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => apiClient.del<void>("/user/profile/image"),
    onSuccess: () => {
      // El DELETE devuelve 204, sin `User`: acá sí hay que refetchear para
      // enterarse de que `profileImage` quedó en null.
      queryClient.invalidateQueries({ queryKey: userQueryKey(userId) });
    },
  });

  return {
    deleteImage: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: errorMessage(mutation.error, "No se pudo quitar la imagen. Intentá nuevamente."),
  };
}

/** Prioriza el `detail` real del backend (A-19) sobre el mensaje genérico —
 *  mismo criterio que `use-update-student-profile.ts`. */
function errorMessage(error: Error | null, fallback: string): string | null {
  if (error instanceof ApiError) return error.message;
  return error ? fallback : null;
}
