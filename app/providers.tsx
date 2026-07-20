"use client";

// Providers globales de la app. Los monta el layout raíz.
//
// Acá viven los defaults de TanStack Query para TODA la app: si un grupo necesita
// otro comportamiento, lo pisa en su useQuery puntual, no acá.
//
// ⚠️ PUNTO DE CONFLICTO entre los 3 grupos — coordinar antes de editar.

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import { TooltipProvider } from "@/components/ui/tooltip";
import { ApiError } from "@/lib/api-client";

function crearQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Los datos son por usuario y cambian poco dentro de una pantalla.
        // 1 min evita refetchear cada vez que se monta un componente.
        staleTime: 60 * 1000,

        retry: (intentos, error) => {
          // Reintentar un 401/403/404 no tiene sentido: la respuesta no va a
          // cambiar sola y solo retrasa el mensaje de error al usuario.
          if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
            return false;
          }
          return intentos < 2;
        },
      },
      mutations: {
        // Una mutación reintentada puede duplicar una postulación o un puesto.
        retry: false,
      },
    },
  });
}

export function Providers({ children }: { children: React.ReactNode }) {
  // useState y no una constante de módulo: en el server, una instancia por
  // módulo se compartiría entre requests de usuarios distintos y filtraría
  // datos de uno a otro.
  const [queryClient] = useState(crearQueryClient);

  // No hay SessionProvider: TanStack Query ya deduplica el GET /me por queryKey,
  // así que un context propio para la sesión sería redundante. Ver
  // features/auth/hooks/use-session.ts.
  //
  // TooltipProvider global: lo necesita el Sidebar colapsado (tooltips con el
  // label al pasar el mouse por los íconos).
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>{children}</TooltipProvider>
    </QueryClientProvider>
  );
}
