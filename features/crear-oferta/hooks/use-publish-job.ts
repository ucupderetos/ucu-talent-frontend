"use client";

import { useMutation } from "@tanstack/react-query";

import type { CreateJobFormValues } from "@/features/crear-oferta/hooks/use-create-job-form";

// TODO: reemplazar por apiClient.post("/vacancy", payload) cuando el back
// esté listo. El payload real (CreateVacancyRequest) necesita companyId y
// areaId reales — hoy areaId es un placeholder de AREAS_PLACEHOLDER en
// JobBasicInfoForm.tsx, falta conectar GET /area.
async function publishJobRequest(values: CreateJobFormValues): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  console.log("TODO: integrar con lib/api-client.ts", values);
}

export function usePublishJob() {
  const mutation = useMutation({ mutationFn: publishJobRequest });

  return {
    publish: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.isError
      ? "No se pudo publicar la oferta. Intentá nuevamente."
      : null,
  };
}