"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient, ApiError } from "@/lib/api-client";
import type {
  CompanyRegistrationInput,
  Registration,
  StudentProfileRegistrationInput,
} from "@/features/auth/types";
import { SESSION_QUERY_KEY } from "@/features/auth/hooks/use-session";
import type { Company, StudentProfile, User } from "@/types";

export type RegistrationProfile = StudentProfileRegistrationInput | CompanyRegistrationInput;

/**
 * Registro real en 3 requests encadenados (`docs/ENDPOINTS.md` + AGENTS.md,
 * "Registro en dos pasos y ProfileGuard") — el orden no es negociable:
 *   1. `POST /user`            — crea la cuenta (email/password/role), pública.
 *      Devuelve `201` pero NO loguea (no setea cookie).
 *   2. `POST /auth/login`      — login explícito, obligatorio: sin esto el
 *      paso 3 (`POST /student-profile`, 🔒 rol ALUMNO) no tiene sesión.
 *   3. `POST /student-profile` (rol ALUMNO) o `POST /company` (rol EMPRESA).
 *
 * Si el paso 3 falla o el usuario cierra la pestaña entre el 2 y el 3, la
 * cuenta queda logueada pero sin perfil — `ProfileGuard`
 * (`features/perfil/components/`) es la red que atrapa ese caso y manda a
 * `/completar-perfil`, que reintenta solo el paso 3.
 */
async function registerRequest(
  registration: Registration,
  profile: RegistrationProfile,
): Promise<void> {
  const account = {
    // Normalizado a minúsculas: si el backend compara el email tal cual
    // llega, "Juan@ucu.edu.uy" y "juan@ucu.edu.uy" no deben poder coexistir
    // como cuentas distintas.
    email: registration.email.toLowerCase(),
    password: registration.password,
  };

  await apiClient.post<User>("/user", { ...account, role: registration.role });
  await apiClient.post<User>("/auth/login", account);

  if (registration.role === "ALUMNO") {
    await apiClient.post<StudentProfile>("/student-profile", profile);
  } else {
    await apiClient.post<Company>("/company", profile);
  }
}

export function useRegister() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      registration,
      profile,
    }: {
      registration: Registration;
      profile: RegistrationProfile;
    }) => registerRequest(registration, profile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY });
    },
  });

  const apiError = mutation.error instanceof ApiError ? mutation.error : null;

  return {
    register: (registration: Registration, profile: RegistrationProfile) =>
      mutation.mutateAsync({ registration, profile }),
    isLoading: mutation.isPending,
    /**
     * El 409 (email ya registrado, paso 1) NO se muestra acá: `RegisterForm`
     * lo captura del `mutateAsync` que rechaza y lo pone como error del campo
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
