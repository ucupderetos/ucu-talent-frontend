"use client";

import { useMutation } from "@tanstack/react-query";

/**
 * Guardado de "Información personal" y "Habilidades" en Mi perfil.
 *
 * 🔴 A diferencia de `useUpdateCompanyProfile` (que sí tiene un `PUT
 * /company/{id}` real esperando conexión), acá NO HAY ningún endpoint de
 * update para `StudentProfile` en `docs/ENDPOINTS.md` — ni uno parcial ni uno
 * completo (A-08 en AGENTS.md). Esto queda mockeado hasta que backend lo
 * agregue; no hay "conectar acá" posible todavía.
 */
async function updateStudentProfileRequest(values: {
  name: string;
  surname: string;
  phoneNumber?: string;
  linkedinUrl?: string;
}): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 600));
}

export function useUpdateStudentProfile() {
  const mutation = useMutation({ mutationFn: updateStudentProfileRequest });

  return {
    updateProfile: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.isError ? "No se pudo guardar el perfil. Intentá nuevamente." : null,
  };
}

/** Mismo gap que arriba (A-08) — `skills` vive en `StudentProfile`, así que
 *  tampoco tiene endpoint propio de update. */
async function updateSkillsRequest(skills: string[]): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 600));
}

export function useUpdateSkills() {
  const mutation = useMutation({ mutationFn: updateSkillsRequest });

  return {
    updateSkills: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.isError ? "No se pudieron guardar las habilidades. Intentá nuevamente." : null,
  };
}
