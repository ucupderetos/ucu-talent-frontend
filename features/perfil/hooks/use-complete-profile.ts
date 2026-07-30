"use client";

// Paso 3 del registro (`POST /student-profile` o `POST /company`), disparado
// desde `/completar-perfil` — ver AGENTS.md, "Registro en dos pasos y
// ProfileGuard". Es el mismo request que `useRegister()` hace en el camino
// feliz; este hook existe para cuando `ProfileGuard` detecta que ese paso
// nunca se completó y hay que reintentarlo con una sesión ya activa.

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { SESSION_QUERY_KEY } from "@/hooks/use-session";
import { apiClient, ApiError } from "@/lib/api-client";
import type {
  Company,
  CompanyRegistrationInput,
  Role,
  StudentProfile,
  StudentProfileRegistrationInput,
} from "@/types";

async function completeProfileRequest(
  role: Extract<Role, "ALUMNO" | "EMPRESA">,
  profile: StudentProfileRegistrationInput | CompanyRegistrationInput,
): Promise<void> {
  if (role === "ALUMNO") {
    await apiClient.post<StudentProfile>("/student-profile", profile);
  } else {
    await apiClient.post<Company>("/company", profile);
  }
}

export function useCompleteProfile() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      role,
      profile,
    }: {
      role: Extract<Role, "ALUMNO" | "EMPRESA">;
      profile: StudentProfileRegistrationInput | CompanyRegistrationInput;
    }) => completeProfileRequest(role, profile),
    onSuccess: () => {
      // Invalida la sesión completa (identidad + perfil): la próxima lectura
      // de `useSession()` va a encontrar el perfil recién creado.
      queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY });
    },
  });

  const apiError = mutation.error instanceof ApiError ? mutation.error : null;

  return {
    complete: (
      role: Extract<Role, "ALUMNO" | "EMPRESA">,
      profile: StudentProfileRegistrationInput | CompanyRegistrationInput,
    ) => mutation.mutateAsync({ role, profile }),
    isLoading: mutation.isPending,
    /**
     * El `detail` del backend (A-19) gana sobre cualquier texto genérico: en
     * este paso el error típico es un 409 con el motivo exacto ("Ya existe un
     * alumno con ese tipo y numero de documento"), y taparlo con "Intentá
     * nuevamente" dejaba al usuario reintentando lo mismo sin saber qué
     * corregir. Solo se cae al genérico cuando no hay mensaje del backend
     * (red caída, 5xx sin cuerpo).
     */
    error: mutation.isError
      ? (apiError?.message ?? "No se pudo completar tu perfil. Intentá nuevamente.")
      : null,
  };
}
