"use client";

import { useMutation } from "@tanstack/react-query";

import type { CompanyProfileFormValues } from "@/features/perfil-empresa/hooks/use-company-profile-form";

// TODO: reemplazar por apiClient.put(`/company/${companyId}`, payload)
// cuando el contrato de la API esté confirmado con el backend (ver AGENTS.md
// → A-11 sobre logoUrl). Ya no hace falta un segundo PUT a /user: razonSocial
// vive en Company según el MER, no en User.
// Una vez conectado: invalidar la query de la empresa (GET /company?userId=)
// en el onSuccess para que el form refleje lo guardado.
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