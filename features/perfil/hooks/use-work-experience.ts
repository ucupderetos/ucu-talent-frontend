"use client";

// CRUD de "Experiencia laboral" en Mi perfil.
// Wire: POST/PUT/DELETE /work-experience (docs/ENDPOINTS.md, sección 4).

import { useMutation } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import type { WorkExperienceInput } from "@/features/perfil/types";
import type { WorkExperience } from "@/types";

export function useCreateWorkExperience() {
  const mutation = useMutation({
    mutationFn: (
      input: WorkExperienceInput & { studentProfileId: string },
    ): Promise<WorkExperience> => apiClient.post<WorkExperience>("/work-experience", input),
  });

  return { createWorkExperience: mutation.mutateAsync, isLoading: mutation.isPending };
}

export function useUpdateWorkExperience() {
  const mutation = useMutation({
    mutationFn: (
      input: WorkExperienceInput & { workExperienceId: string; studentProfileId: string },
    ): Promise<WorkExperience> => {
      const { workExperienceId, studentProfileId: _studentProfileId, ...payload } = input;
      return apiClient.put<WorkExperience>(`/work-experience/${workExperienceId}`, payload);
    },
  });

  return { updateWorkExperience: mutation.mutateAsync, isLoading: mutation.isPending };
}

export function useDeleteWorkExperience() {
  const mutation = useMutation({
    mutationFn: (workExperienceId: string): Promise<void> =>
      apiClient.del<void>(`/work-experience/${workExperienceId}`),
  });

  return { deleteWorkExperience: mutation.mutateAsync, isLoading: mutation.isPending };
}
