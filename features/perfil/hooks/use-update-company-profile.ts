"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient, ApiError } from "@/lib/api-client";
import { useCurrentCompany, CURRENT_COMPANY_QUERY_KEY } from "@/features/puestos/hooks/use-current-company";
import type { CompanyProfileFormValues } from "@/features/perfil/hooks/use-company-profile-form";
import type { Company } from "@/types";

async function updateCompanyProfileRequest(
  companyId: string,
  values: CompanyProfileFormValues,
): Promise<Company> {
  return apiClient.put<Company>(`/company/${companyId}`, values);
}

export function useUpdateCompanyProfile() {
  const { company } = useCurrentCompany();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (values: CompanyProfileFormValues) => {
      if (!company) {
        throw new Error("No se pudo resolver la empresa logueada.");
      }
      return updateCompanyProfileRequest(company.companyId, values);
    },
    onSuccess: () => {
      // Refresca la Company en cache — el form vuelve a sembrarse con lo
      // que el back confirmó que guardó, no con lo que mandamos a ciegas.
      queryClient.invalidateQueries({ queryKey: CURRENT_COMPANY_QUERY_KEY });
    },
  });

  const apiError = mutation.error instanceof ApiError ? mutation.error : null;

  return {
    updateProfile: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.isError
      ? apiError?.status === 400
        ? "Revisá los datos ingresados."
        : "No se pudo guardar el perfil. Intentá nuevamente."
      : null,
  };
}