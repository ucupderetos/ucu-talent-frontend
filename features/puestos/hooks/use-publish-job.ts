"use client";

import { useMutation } from "@tanstack/react-query";

import { useCurrentCompany } from "@/features/puestos/hooks/use-current-company";
import type { VacancyInput } from "@/features/puestos/types";
import type { JobFormValues } from "@/features/puestos/hooks/use-create-job-form";

// TODO: reemplazar por apiClient.post("/vacancy", payload) cuando el back
// esté listo. areaId es un placeholder de AREAS_PLACEHOLDER en
// job-basic-info-form.tsx, falta conectar GET /area.
async function publishJobRequest(payload: VacancyInput): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  console.log("TODO: integrar con lib/api-client.ts", payload);
}

export function usePublishJob() {
  const { company } = useCurrentCompany();
  const mutation = useMutation({ mutationFn: publishJobRequest });

  /** Arma el VacancyInput real (con companyId de la empresa logueada) a
   *  partir de los valores del form, y dispara la mutación.
   *
   *  A-15: RF-PUE-01 dice que `location` no es obligatorio si la modalidad
   *  es remota, pero VacancyInput.location no es opcional — el back todavía
   *  no resolvió ese caso. Frenamos con un error explícito en vez de mandar
   *  "" silenciosamente, para no ocultar el gap. */
  function publish(values: JobFormValues) {
    if (!company) {
      throw new Error("No se pudo resolver la empresa logueada.");
    }

    if (!values.location) {
      throw new Error(
        "El backend todavía no define qué mandar como ubicación para puestos remotos (A-15). No se puede publicar.",
      );
    }

    const payload: VacancyInput = {
      companyId: company.companyId,
      name: values.name,
      description: values.description,
      requirements: values.requirements,
      areaId: values.areaId,
      contractType: values.contractType,
      modality: values.modality,
      salaryRange: values.salaryRange,
      location: values.location,
    };

    return mutation.mutateAsync(payload);
  }

  return {
    publish,
    isLoading: mutation.isPending,
    error: mutation.isError
      ? "No se pudo publicar la oferta. Intentá nuevamente."
      : null,
  };
}