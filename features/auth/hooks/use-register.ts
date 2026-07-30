"use client";

import { useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient, ApiError } from "@/lib/api-client";
import type { Registration } from "@/features/auth/types";
import { SESSION_QUERY_KEY } from "@/hooks/use-session";
import type {
  Company,
  CompanyRegistrationInput,
  StudentProfile,
  StudentProfileRegistrationInput,
  User,
} from "@/types";

export type RegistrationProfile = StudentProfileRegistrationInput | CompanyRegistrationInput;

/** En cuál de las 3 llamadas encadenadas falló el registro. */
export type RegistrationStep = "cuenta" | "sesion" | "perfil";

/**
 * Error de registro que dice EN QUÉ PASO falló, no solo qué status devolvió.
 *
 * Hace falta porque **los tres pasos pueden devolver 409** y por motivos
 * distintos (todos `DuplicateResourceException` en el backend, verificado
 * contra `UserServiceImpl.create` y `StudentProfileServiceImpl.create`):
 *
 *   - paso `cuenta`: "Ya existe un usuario con el email '…'"
 *   - paso `perfil`: "El usuario '…' ya tiene un perfil de alumno asociado"
 *   - paso `perfil`: "Ya existe un alumno con ese tipo y numero de documento"
 *
 * Sin el paso, `RegisterForm` no puede distinguirlos: trataba cualquier 409
 * como email duplicado, así que un documento repetido devolvía al usuario al
 * paso 1 con el mensaje "Ese email ya está registrado" — falso, y apuntando a
 * un campo que no era el del problema.
 */
export class RegistrationError extends Error {
  constructor(
    readonly step: RegistrationStep,
    readonly apiError: ApiError,
  ) {
    super(apiError.message);
    this.name = "RegistrationError";
  }
}

/** Etiqueta con su paso cualquier `ApiError` que salga de la llamada. */
async function runStep<T>(step: RegistrationStep, call: () => Promise<T>): Promise<T> {
  try {
    return await call();
  } catch (cause) {
    if (cause instanceof ApiError) throw new RegistrationError(step, cause);
    throw cause;
  }
}

/**
 * Registro real en 3 requests encadenados (`docs/ENDPOINTS.md` +
 * `docs/agents/roles-and-access-control.md`, "Registro en dos pasos y
 * ProfileGuard") — el orden no es negociable:
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
export function useRegister() {
  const queryClient = useQueryClient();

  /**
   * Email para el que ya se completaron los pasos 1 y 2.
   *
   * Los tres pasos NO son idempotentes: si el 3 falla (documento repetido, por
   * ejemplo), la cuenta ya está creada y la sesión abierta. Reenviar el
   * formulario entero repetía `POST /user` y chocaba con un 409 de email — la
   * propia cuenta que el usuario acababa de crear — dejándolo trabado sin forma
   * de terminar el registro. Con esto, un reintento con el mismo email va
   * directo al paso 3, que es el único que faltaba.
   *
   * Si el usuario vuelve al paso 1 y cambia el email, el ref deja de coincidir
   * y se crea la cuenta nueva, como corresponde. ⚠️ Cambiar solo la contraseña
   * no la actualiza en el backend: la cuenta ya existe con la primera. Es un
   * borde conocido, no hay endpoint para cambiarla (recuperación de contraseña
   * está fuera de alcance del MVP).
   */
  const accountReadyForEmail = useRef<string | null>(null);

  const mutation = useMutation({
    mutationFn: async ({
      registration,
      profile,
    }: {
      registration: Registration;
      profile: RegistrationProfile;
    }) => {
      const account = {
        // Normalizado a minúsculas: si el backend compara el email tal cual
        // llega, "Juan@ucu.edu.uy" y "juan@ucu.edu.uy" no deben poder coexistir
        // como cuentas distintas.
        email: registration.email.toLowerCase(),
        password: registration.password,
      };

      if (accountReadyForEmail.current !== account.email) {
        await runStep("cuenta", () =>
          apiClient.post<User>("/user", { ...account, role: registration.role }),
        );
        await runStep("sesion", () => apiClient.post<User>("/auth/login", account));
        accountReadyForEmail.current = account.email;
      }

      if (registration.role === "ALUMNO") {
        await runStep("perfil", () => apiClient.post<StudentProfile>("/student-profile", profile));
      } else {
        await runStep("perfil", () => apiClient.post<Company>("/company", profile));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY });
    },
  });

  return {
    register: (registration: Registration, profile: RegistrationProfile) =>
      mutation.mutateAsync({ registration, profile }),
    isLoading: mutation.isPending,
    /**
     * Mensaje para el banner del paso 2. Devuelve `null` cuando el error ya se
     * muestra pegado a un campo:
     *
     * - 409 del paso `cuenta` → lo pone `RegisterForm` en el campo `email`.
     * - 400 con mapa `errores` (A-19) → lo pone `RegisterForm` campo por campo.
     *
     * El 409 del paso `perfil` SÍ sale acá, con el `detail` real del backend
     * ("Ya existe un alumno con ese tipo y numero de documento"): antes se
     * silenciaba junto con el otro 409 y el usuario no veía ninguna explicación.
     */
    error: registrationErrorMessage(mutation.error),
  };
}

function registrationErrorMessage(error: Error | null): string | null {
  if (!error) return null;
  if (!(error instanceof RegistrationError)) {
    return "No se pudo completar el registro. Intentá nuevamente.";
  }

  const { step, apiError } = error;

  if (step === "cuenta" && apiError.status === 409) return null;
  if (apiError.status === 400 && apiError.fieldErrors) return null;

  // La cuenta quedó creada pero sin sesión: el paso 3 necesita estar logueado,
  // así que no se puede seguir desde acá. Con la cuenta ya existente, el camino
  // es iniciar sesión — `ProfileGuard` lleva sola a `/completar-perfil`.
  if (step === "sesion") {
    return "Creamos tu cuenta, pero no pudimos iniciar sesión automáticamente. Probá entrar desde “Iniciá sesión”.";
  }

  // El `detail` del backend (A-19) es más útil que cualquier texto genérico:
  // dice exactamente qué está duplicado o mal.
  if (apiError.status === 409 || apiError.status === 400) return apiError.message;

  return "No se pudo completar el registro. Intentá nuevamente.";
}
