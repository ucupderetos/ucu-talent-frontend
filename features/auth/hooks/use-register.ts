"use client";

import { useMutation } from "@tanstack/react-query";

import type { StudentRegistration } from "@/features/auth/types";

// TODO: reemplazar por apiClient.post("/registro", registration) cuando el
// contrato de la API (endpoint, forma de auth) esté definido con el backend.
// Una vez conectado: invalidar SESSION_QUERY_KEY (features/auth/hooks/use-session.ts)
// en el onSuccess para que RoleGuard/GuestOnly vean la sesión nueva, y redirigir
// con homeRouteFor(user.role) desde el componente.
async function registerRequest(registration: StudentRegistration): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  console.log("TODO: integrar con lib/api-client.ts", registration.email);
}

export function useRegister() {
  const mutation = useMutation({ mutationFn: registerRequest });

  return {
    register: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.isError ? "No se pudo completar el registro. Intentá nuevamente." : null,
  };
}
