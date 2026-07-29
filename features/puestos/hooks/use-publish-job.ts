"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useCurrentCompany } from "@/hooks/use-current-company";
import type { VacancyInput } from "@/features/puestos/types";
import type { JobFormValues } from "@/features/puestos/hooks/use-create-job-form";
import type { Vacancy } from "@/types";

// ⚠️ `POST /vacancy` espera `salary`, NO `salaryRange` — a diferencia del
// `PUT` (`use-edit-job.ts`). No es un rename simétrico entre los dos DTOs de
// escritura: verificado 2026-07-29 contra el código fuente del backend
// (`vacancy/dto/CreateVacancyRequest.java`, rama `dev`), `salary` es el campo
// real y además es `@NotBlank` — mandar `salaryRange` deja `salary=null` y el
// backend responde `400 "El salario es obligatorio"`, rompiendo la creación.
// Por eso acá se postea `payload` tal cual (con `salary`); el mapeo a
// `salaryRange` es exclusivo del `PUT`, donde el DTO sí usa ese nombre.
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
   *  A-15: `location` es obligatorio en `CreateVacancyRequest` para TODAS las
   *  modalidades (incluida REMOTO) — el contrato no confirma la nulabilidad
   *  condicional que preveía RF-PUE-01. El schema del form ya lo exige, así
   *  que `values.location` siempre llega definido. */
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
      salary: values.salary,
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