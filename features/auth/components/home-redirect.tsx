"use client";

// Landing de `/`: no tiene contenido propio, es solo un router. Manda a la
// sección del rol si hay sesión (mismo criterio que `GuestOnly`: logueado → su
// sección) o a `/login` si no hay (mismo criterio que `RoleGuard`: sin sesión →
// login), combinados para la raíz.
//
// Aplica igual en localhost y en el dominio de producción: la ruta es `/` sin
// importar el host, así que no hace falta tocar nada al salir a prod.
//
// Un `error` del backend cae en la rama "sin sesión" → `/login`: es público y
// su `GuestOnly` deja ver el formulario aunque `/me` falle (no vuelve a
// redirigir), así que no hay loop. No lo tratamos aparte como en `RoleGuard`
// porque acá no hay contenido propio que proteger, solo a dónde mandar.

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useSession } from "@/hooks/use-session";
import { homeRouteFor } from "@/lib/auth";

export function HomeRedirect() {
  const { user, isLoading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    router.replace(user ? homeRouteFor(user.role) : "/login");
  }, [isLoading, user, router]);

  // Mientras resuelve `GET /me` (y durante el redirect), un fallback mínimo para
  // no parpadear contenido que no corresponde.
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <p className="text-sm text-muted-foreground">Cargando...</p>
    </div>
  );
}
