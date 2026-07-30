"use client";

// Inverso de RoleGuard: envuelve las pantallas de (auth). Si ya hay sesión, no
// tiene sentido mostrar login/registro — te manda a la sección de tu rol.
//
// Un `error` del backend acá NO bloquea: si no podemos preguntar quién sos, lo
// razonable es dejarte ver el login igual, no dejarte encerrado afuera.

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useSession } from "@/hooks/use-session";
import { homeRouteFor } from "@/lib/auth";

export function GuestOnly({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback: React.ReactNode;
}) {
  const { user, isLoading, error } = useSession();
  const router = useRouter();
  const destination = user && !error ? homeRouteFor(user.role) : undefined;

  useEffect(() => {
    if (!isLoading && destination) router.replace(destination);
  }, [isLoading, destination, router]);

  // Mientras carga, o mientras se redirige a su sección si ya hay sesión:
  // mismo fallback que el de loading — así una sesión vieja no deja la
  // pantalla en blanco, se ve como que está cargando (que es, en los hechos,
  // lo que está pasando).
  //
  // Con `error` NO se entra acá aunque `user` sea truthy: `useSession` arma el
  // usuario con `{...identity, ...displayProfile}`, así que si `GET /me` anduvo
  // pero la consulta del perfil falló, `user` queda truthy con `error` al mismo
  // tiempo. Bloquear ahí dejaba el login en blanco sin salida — justo lo
  // contrario de lo que dice el comentario de arriba.
  if (isLoading || destination) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
