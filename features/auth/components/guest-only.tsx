"use client";

// Inverso de RoleGuard: envuelve las pantallas de (auth). Si ya hay sesión, no
// tiene sentido mostrar login/registro — te manda a la sección de tu rol.
//
// Un `error` del backend acá NO bloquea: si no podemos preguntar quién sos, lo
// razonable es dejarte ver el login igual, no dejarte encerrado afuera.

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/features/auth/hooks/use-session";
import { homeRouteFor } from "@/lib/auth";

export function GuestOnly({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) router.replace(homeRouteFor(user.role));
  }, [isLoading, user, router]);

  if (isLoading) {
    return <Skeleton className="h-64 w-full max-w-sm" />;
  }

  // Redirigiendo a su sección: no parpadeamos el formulario de login.
  if (user) return null;

  return <>{children}</>;
}
