"use client";

import { useMutation } from "@tanstack/react-query";

import type { CompanyProfileFormValues } from "@/features/perfil/hooks/use-company-profile-form";

// PUT /company/{id} ya existe en docs/ENDPOINTS.md — conectar acá con
// apiClient.put(). No hace falta un segundo PUT a /user: legalName vive en
// Company según el MER, no en User. Al conectar: invalidar la query de la
// empresa (GET /company?userId=) en el onSuccess para que el form refleje
// lo guardado.
async function updateCompanyProfileRequest(
  values: CompanyProfileFormValues,
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 600));
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