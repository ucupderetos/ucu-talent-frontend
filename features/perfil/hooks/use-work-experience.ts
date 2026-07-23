"use client";

// CRUD de "Experiencia laboral" en Mi perfil. Mismo criterio que
// use-education.ts: endpoints reales pero sin contrato de autorización
// confirmado (A-12 en AGENTS.md) — mockeado con delay simulado e id
// generado en el cliente.

import { useMutation } from "@tanstack/react-query";

import type { WorkExperienceInput } from "@/features/perfil/types";
import type { WorkExperience } from "@/types";

export function useCreateWorkExperience() {
  const mutation = useMutation({
    mutationFn: async (
      input: WorkExperienceInput & { studentProfileId: string },
    ): Promise<WorkExperience> => {
      await new Promise((resolve) => setTimeout(resolve, 400));
      return {
        workExperienceId: crypto.randomUUID(),
        studentProfileId: input.studentProfileId,
        company: input.company ?? null,
        position: input.position ?? null,
        startDate: input.startDate ?? null,
        endDate: input.endDate ?? null,
        description: input.description ?? null,
      };
    },
  });

  return { createWorkExperience: mutation.mutateAsync, isLoading: mutation.isPending };
}

export function useUpdateWorkExperience() {
  const mutation = useMutation({
    mutationFn: async (
      input: WorkExperienceInput & { workExperienceId: string; studentProfileId: string },
    ): Promise<WorkExperience> => {
      await new Promise((resolve) => setTimeout(resolve, 400));
      return {
        workExperienceId: input.workExperienceId,
        studentProfileId: input.studentProfileId,
        company: input.company ?? null,
        position: input.position ?? null,
        startDate: input.startDate ?? null,
        endDate: input.endDate ?? null,
        description: input.description ?? null,
      };
    },
  });

  return { updateWorkExperience: mutation.mutateAsync, isLoading: mutation.isPending };
}

export function useDeleteWorkExperience() {
  const mutation = useMutation({
    mutationFn: async (workExperienceId: string): Promise<void> => {
      await new Promise((resolve) => setTimeout(resolve, 400));
    },
  });

  return { deleteWorkExperience: mutation.mutateAsync, isLoading: mutation.isPending };
}
