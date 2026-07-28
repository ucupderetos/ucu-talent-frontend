"use client";

// CRUD de "Experiencia laboral" en Mi perfil.
// Wire: POST/PUT/DELETE /work-experience (docs/ENDPOINTS.md, sección 4).

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import { studentProfileQueryKey } from "@/features/perfil/hooks/use-student-profile";
import type { WorkExperienceInput } from "@/features/perfil/types";
import type { WorkExperience } from "@/types";

export function useCreateWorkExperience() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (
      input: WorkExperienceInput & { studentProfileId: string },
    ): Promise<WorkExperience> => apiClient.post<WorkExperience>("/work-experience", input),
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({
        queryKey: studentProfileQueryKey(variables.studentProfileId),
      }),
  });

  return { createWorkExperience: mutation.mutateAsync, isLoading: mutation.isPending };
}

export function useUpdateWorkExperience() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (
      input: WorkExperienceInput & { workExperienceId: string; studentProfileId: string },
    ): Promise<WorkExperience> => {
      const { workExperienceId, studentProfileId: _studentProfileId, ...payload } = input;
      return apiClient.put<WorkExperience>(`/work-experience/${workExperienceId}`, payload);
    },
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({
        queryKey: studentProfileQueryKey(variables.studentProfileId),
      }),
  });

  return { updateWorkExperience: mutation.mutateAsync, isLoading: mutation.isPending };
}

export function useDeleteWorkExperience() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({
      workExperienceId,
    }: {
      workExperienceId: string;
      studentProfileId: string;
    }): Promise<void> => apiClient.del<void>(`/work-experience/${workExperienceId}`),
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({
        queryKey: studentProfileQueryKey(variables.studentProfileId),
      }),
  });

  return { deleteWorkExperience: mutation.mutateAsync, isLoading: mutation.isPending };
}
