"use client";

import { useMutation } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import { useCurrentCompany } from "@/hooks/use-current-company";
import type { VacancyInput } from "@/features/puestos/types";
import type { JobFormValues } from "@/features/puestos/hooks/use-create-job-form";

// POST /vacancy real. El backend fuerza el status inicial, no lo mandamos.
// ⚠️ TODO(areaId): hoy `areaId` sale de AREAS_PLACEHOLDER en
// job-basic-info-form.tsx — hasta conectar GET /area (A-20) el back va a
// rechazar el valor. Se pega al endpoint real igual, para no simular un éxito
// falso: si falla, el error se surfacea en la pantalla de revisión (toast).
function publishJobRequest(payload: VacancyInput): Promise<void> {
  return apiClient.post<void>("/vacancy", payload);
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
  };
}