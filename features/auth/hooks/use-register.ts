"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient, ApiError } from "@/lib/api-client";
import type { Registration } from "@/features/auth/types";
import { SESSION_QUERY_KEY } from "@/features/auth/hooks/use-session";
import type { User } from "@/types";

/**
 * Registro real en 2 requests secuenciales (`docs/ENDPOINTS.md`):
 *   1. `POST /user` — crea la cuenta (email/password/role), pública.
 *   2. `POST /auth/login` — login explícito con las mismas credenciales.
 *
 * `POST /user` NO loguea (no está en la tabla como generador de `Set-Cookie`,
 * a diferencia de `POST /auth/login`): la cuenta queda creada pero sin sesión.
 * Por eso el paso 2 es un login explícito — si no, el usuario tendría que ir
 * a /login a mano después de registrarse.
 *
 * El perfil (`StudentProfile`/`Company`) NO se crea acá — decisión de equipo:
 * el registro solo pide email/contraseña/rol; cédula, nombre, RUT, etc. se
 * completan después desde "editar perfil" (`features/perfil/`, todavía sin
 * construir). Esto también evita el problema de cuenta huérfana que existía
 * cuando el registro intentaba crear el perfil en el mismo flujo.
 */
async function registerRequest(registration: Registration): Promise<void> {
  const account = {
    // Normalizado a minúsculas: si el backend compara el email tal cual
    // llega, "Juan@ucu.edu.uy" y "juan@ucu.edu.uy" no deben poder coexistir
    // como cuentas distintas.
    email: registration.email.toLowerCase(),
    password: registration.password,
  };

  await apiClient.post<User>("/user", { ...account, role: registration.role });
  await apiClient.post<User>("/auth/login", account);
}

export function useRegister() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: registerRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY });
    },
  });

  const apiError = mutation.error instanceof ApiError ? mutation.error : null;

  return {
    register: mutation.mutateAsync,
    isLoading: mutation.isPending,
    /**
     * El 409 (email ya registrado) NO se muestra acá: `RegisterForm` lo
     * captura del `mutateAsync` que rechaza y lo pone como error del campo
     * `email` (`setError("email", ...)`), no como banner genérico.
     */
    error:
      mutation.isError && apiError?.status !== 409
        ? apiError?.status === 400
          ? "Revisá los datos ingresados."
          : "No se pudo completar el registro. Intentá nuevamente."
        : null,
  };
}
