"use client";

import { useMutation } from "@tanstack/react-query";

import type { Credentials } from "@/features/auth/types";

// TODO: reemplazar por apiClient.post("/login", credentials) cuando el
// contrato de la API (endpoint, forma de auth) esté definido con el backend.
// Una vez conectado: invalidar SESSION_QUERY_KEY (features/auth/hooks/use-session.ts)
// en el onSuccess para que RoleGuard/GuestOnly vean la sesión nueva, y redirigir
// con homeRouteFor(user.role) desde el componente.
async function loginRequest(credentials: Credentials): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  console.log("TODO: integrar con lib/api-client.ts", credentials.email);
}

export function useLogin() {
  const mutation = useMutation({ mutationFn: loginRequest });

  return {
    login: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.isError ? "No se pudo iniciar sesión. Intentá nuevamente." : null,
  };
}
