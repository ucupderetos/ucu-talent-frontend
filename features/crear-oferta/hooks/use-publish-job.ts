"use client";

import { useMutation } from "@tanstack/react-query";

import { useCurrentCompany } from "@/features/puestos/hooks/use-current-company";
import type { VacancyInput } from "@/features/puestos/types";
import type { JobFormValues } from "@/features/crear-oferta/hooks/use-create-job-form";

// TODO: reemplazar por apiClient.post("/vacancy", payload) cuando el back
// esté listo. areaId es un placeholder de AREAS_PLACEHOLDER en
// JobBasicInfoForm.tsx, falta conectar GET /area.
async function publishJobRequest(payload: VacancyInput): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  console.log("TODO: integrar con lib/api-client.ts", payload);
}

export function usePublishJob() {
  const { company } = useCurrentCompany();
  const mutation = useMutation({ mutationFn: publishJobRequest });

  /** Arma el VacancyInput real (con companyId de la empresa logueada) a
   *  partir de los valores del form, y dispara la mutación. */
  function publish(values: JobFormValues) {
    if (!company) {
      throw new Error("No se pudo resolver la empresa logueada.");
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
      // TODO: location es obligatorio en VacancyInput, pero opcional en el
      // form cuando la modalidad es REMOTO (RF-PUE-01). Confirmar con backend
      // qué mandar en ese caso — hoy se manda el último valor cargado o "".
      location: (values.location ?? "") as VacancyInput["location"],
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