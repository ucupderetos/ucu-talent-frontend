"use client";

// CRUD de "Formación académica" en Mi perfil.
// Wire: POST/PUT/DELETE /education + GET /education?studentProfileId={id}
// (docs/ENDPOINTS.md, sección 4). El catálogo de carreras sale de
// GET /degree.

import { useQuery, useMutation } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import type { EducationInput } from "@/features/perfil/types";
import type { Degree, Education } from "@/types";

/** @public para invalidación puntual futura (AGENTS.md). */
export function degreesQueryKey() {
  return ["perfil", "degrees"] as const;
}

/** Catálogo de carreras para el select de "Formación académica". */
export function useDegrees(): readonly Degree[] {
  const { data } = useQuery({
    queryKey: degreesQueryKey(),
    queryFn: () => apiClient.get<Degree[]>("/degree"),
  });

  return data ?? [];
}

export function useCreateEducation() {
  const mutation = useMutation({
    mutationFn: (input: EducationInput & { studentProfileId: string }): Promise<Education> =>
      apiClient.post<Education>("/education", input),
  });

  return { createEducation: mutation.mutateAsync, isLoading: mutation.isPending };
}

export function useUpdateEducation() {
  const mutation = useMutation({
    mutationFn: (
      input: EducationInput & { educationId: string; studentProfileId: string },
    ): Promise<Education> => {
      const { educationId, ...payload } = input;
      return apiClient.put<Education>(`/education/${educationId}`, payload);
    },
  });

  return { updateEducation: mutation.mutateAsync, isLoading: mutation.isPending };
}

export function useDeleteEducation() {
  const mutation = useMutation({
    mutationFn: (educationId: string): Promise<void> =>
      apiClient.del<void>(`/education/${educationId}`),
  });

  return { deleteEducation: mutation.mutateAsync, isLoading: mutation.isPending };
}
