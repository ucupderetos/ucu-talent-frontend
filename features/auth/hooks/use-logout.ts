"use client";

// Cerrar sesión: invalida la sesión del lado del backend y limpia el cache
// local para que `useSession()` (y los guards que dependen de ella) vuelvan
// a preguntar por GET /me en la próxima carga.
//
// `POST /auth/logout` (docs/ENDPOINTS.md, sección 7) vence la cookie httpOnly
// del lado del servidor. Es público, no hace falta sesión para llamarlo.

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { SESSION_QUERY_KEY } from "@/features/auth/hooks/use-session";
import { apiClient } from "@/lib/api-client";

const LOGOUT_ENDPOINT = "/auth/logout";

/**
 * En modo mock (`NEXT_PUBLIC_MOCK_SESSION`) no hay cookie real que invalidar:
 * el usuario sale de una variable de entorno, no del backend. Igual se limpia
 * el cache y se redirige, pero la próxima carga vuelve a loguear con el mismo
 * rol — para "salir" de verdad en desarrollo hay que sacar la variable de
 * `.env.local`.
 */
const IS_MOCK_SESSION = Boolean(process.env.NEXT_PUBLIC_MOCK_SESSION);

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      if (IS_MOCK_SESSION) return;
      await apiClient.post(LOGOUT_ENDPOINT);
    },
    onSuccess: () => {
      queryClient.setQueryData(SESSION_QUERY_KEY, null);
      router.push("/login");
    },
  });
}
