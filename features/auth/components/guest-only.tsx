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

  // Mientras se redirige a su sección (ya sabemos que hay sesión): mismo
  // fallback que el de loading, para no dejar ver el form un instante antes
  // de irse.
  //
  // Mientras el `GET /me` todavía está en vuelo (`isLoading`) se muestran los
  // `children` de una — la gran mayoría de las visitas a /login y /registro
  // son de alguien sin sesión, así que no tiene sentido tapar el formulario
  // real (que no depende de la sesión para nada, ni lee `user`) detrás de un
  // skeleton solo para cubrir el caso minoritario de una sesión vieja. Antes
  // esperaba `isLoading` también, y con el backend lento/en cold start eso
  // dejaba el formulario tapado por varios segundos sin necesidad.
  //
  // Con `error` NO se entra a la rama de redirect aunque `user` sea truthy:
  // `useSession` arma el usuario con `{...identity, ...displayProfile}`, así
  // que si `GET /me` anduvo pero la consulta del perfil falló, `user` queda
  // truthy con `error` al mismo tiempo. Bloquear ahí dejaba el login en
  // blanco sin salida — justo lo contrario de lo que dice el comentario de
  // arriba.
  if (destination) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
