"use client";

import { useMutation } from "@tanstack/react-query";

import type { CompanyProfileFormValues } from "@/features/perfil-empresa/types";

// TODO: reemplazar por apiClient.put(`/company/${companyId}`, payload) (y un
// segundo apiClient.put(`/user/${userId}`, { name }) para el nombre, que vive
// en User) cuando el contrato de la API esté confirmado con el backend.
// Una vez conectado: invalidar la query de la empresa (GET /company?userId=)
// en el onSuccess para que la vista previa y el form reflejen lo guardado.
async function updateCompanyProfileRequest(
  values: CompanyProfileFormValues,
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  console.log("TODO: integrar con lib/api-client.ts", values);
}

export function useUpdateCompanyProfile() {
  const mutation = useMutation({ mutationFn: updateCompanyProfileRequest });

  return {
    updateProfile: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.isError
      ? "No se pudo guardar el perfil. Intentá nuevamente."
      : null,
  };
}