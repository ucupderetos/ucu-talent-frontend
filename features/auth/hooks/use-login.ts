"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient, ApiError } from "@/lib/api-client";
import type { Credentials } from "@/features/auth/types";
import { SESSION_QUERY_KEY } from "@/features/auth/hooks/use-session";
import type { User } from "@/types";

/**
 * `POST /auth/login` — 🌐 público. Devuelve `UserResponse` y setea la cookie
 * httpOnly de sesión (`Set-Cookie`, la maneja el browser solo gracias a
 * `credentials: "include"` en lib/api-client.ts). No hay token que guardar acá.
 */
function loginRequest(credentials: Credentials): Promise<User> {
  return apiClient.post<User>("/auth/login", credentials);
}

export function useLogin() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: loginRequest,
    onSuccess: () => {
      // La cookie ya está seteada: invalidamos para que RoleGuard/GuestOnly
      // vuelvan a preguntarle a /me y vean la sesión nueva.
      queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY });
    },
  });

  const apiError = mutation.error instanceof ApiError ? mutation.error : null;

  return {
    login: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.isError
      ? apiError?.status === 401
        ? "El email o la contraseña son incorrectos."
        : apiError?.status === 400
          ? "Completá el email y la contraseña."
          : "No se pudo iniciar sesión. Intentá nuevamente."
      : null,
  };
}
