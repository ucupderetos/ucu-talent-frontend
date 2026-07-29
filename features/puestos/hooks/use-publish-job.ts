"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useCurrentCompany } from "@/hooks/use-current-company";
import type { VacancyInput } from "@/features/puestos/types";
import type { JobFormValues } from "@/features/puestos/hooks/use-create-job-form";
import type { Vacancy } from "@/types";

// POST /vacancy real. El backend fuerza el status inicial, no lo mandamos.
// `VacancyInput` ya trae `salary`/`publicationDate`/`closingDate` con la forma
// que espera `CreateVacancyRequest` (el mapeo `salaryRange`→`salary` lo hace
// `publish()` abajo, con los valores del form), así que se postea tal cual.
function publishJobRequest(payload: VacancyInput): Promise<Vacancy> {
  return apiClient.post<Vacancy>("/vacancy", payload);
}

export function usePublishJob() {
  const { company } = useCurrentCompany();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: publishJobRequest,
    onSuccess: () => {
      // Prefijo del queryKey de companyVacanciesQueryKey() — invalida todas
      // las variantes de filtros/paginación de "Mis ofertas" para esta
      // empresa a la vez (TanStack matchea por prefijo).
      queryClient.invalidateQueries({ queryKey: ["puestos", "empresa", company?.companyId] });
    },
  });

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
      // El form le dice "rango salarial" al usuario (así lo pide
      // `UpdateVacancyRequest.salaryRange`), pero `CreateVacancyRequest`
      // real espera `salary` — ver el aviso en `VacancyInput`, types.ts.
      salary: values.salaryRange,
      location: values.location,
      publicationDate: values.publicationDate,
      closingDate: values.closingDate,
    };

    return mutation.mutateAsync(payload);
  }

  return {
    publish,
    isLoading: mutation.isPending,
  };
}