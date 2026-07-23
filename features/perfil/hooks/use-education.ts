"use client";

// CRUD de "Formación académica" en Mi perfil.
//
// ⚠️ ANDAMIO TEMPORAL: a diferencia de `StudentProfile` (A-08, sin PUT
// alguno), `education` sí aparece en docs/ENDPOINTS.md con endpoints propios
// — pero marcados "⚠️ Sin restricción" (A-12 en AGENTS.md), es decir sin
// contrato de autorización confirmado todavía. Mientras tanto esto resuelve
// todo con un delay simulado y un id generado en el cliente; no pega contra
// la API real.

import { useMutation } from "@tanstack/react-query";

import type { EducationInput } from "@/features/perfil/types";
import type { Education } from "@/types";

export function useCreateEducation() {
  const mutation = useMutation({
    mutationFn: async (input: EducationInput & { studentProfileId: string }): Promise<Education> => {
      await new Promise((resolve) => setTimeout(resolve, 400));
      return { ...input, educationId: crypto.randomUUID(), description: input.description ?? null };
    },
  });

  return { createEducation: mutation.mutateAsync, isLoading: mutation.isPending };
}

export function useUpdateEducation() {
  const mutation = useMutation({
    mutationFn: async (input: EducationInput & { educationId: string; studentProfileId: string }): Promise<Education> => {
      await new Promise((resolve) => setTimeout(resolve, 400));
      return { ...input, description: input.description ?? null };
    },
  });

  return { updateEducation: mutation.mutateAsync, isLoading: mutation.isPending };
}

export function useDeleteEducation() {
  const mutation = useMutation({
    mutationFn: async (educationId: string): Promise<void> => {
      await new Promise((resolve) => setTimeout(resolve, 400));
    },
  });

  return { deleteEducation: mutation.mutateAsync, isLoading: mutation.isPending };
}
