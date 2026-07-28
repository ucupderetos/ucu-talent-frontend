"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient, ApiError } from "@/lib/api-client";
import { useSession } from "@/hooks/use-session";
import { companyProfileQueryKey } from "@/features/perfil/hooks/use-company-profile";
import type { CompanyProfileFormValues } from "@/features/perfil/hooks/use-company-profile-form";
import type { UpdateCompanyInput } from "@/features/perfil/types";
import type { Company } from "@/types";

/**
 * Guardado del perfil de empresa. Wire: `PUT /company/{id}`, body
 * `UpdateCompanyRequest` (docs/ENDPOINTS.md, sección 3). La PK es compartida
 * (`companyId === userId`), así que el `userId` de la sesión es el `{id}` del
 * path — y el candado "🔒 + dueño" del endpoint se cumple solo.
 *
 * `rut`, `phoneNumber` y `logoUrl` del formulario NO se mandan: no están en el
 * contrato. Cuando el backend los exponga se agregan acá y en
 * `UpdateCompanyInput`/`toCompanyProfile`.
 */
function toUpdateCompanyRequest(values: CompanyProfileFormValues): UpdateCompanyInput {
  return {
    name: values.legalName,
    industry: values.industry,
    description: values.description,
    webUrl: values.webUrl,
    linkedinUrl: values.linkedinUrl,
    location: values.location,
  };
}

export function useUpdateCompanyProfile() {
  const { user } = useSession();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (values: CompanyProfileFormValues) => {
      if (!user) {
        throw new Error("No se pudo resolver la empresa logueada.");
      }
      return apiClient.put<Company>(`/company/${user.userId}`, toUpdateCompanyRequest(values));
    },
    onSuccess: () => {
      // Refresca la Company en cache — al reabrir el form se siembra con lo que
      // el back confirmó que guardó, no con lo que mandamos a ciegas.
      queryClient.invalidateQueries({ queryKey: companyProfileQueryKey(user?.userId) });
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
