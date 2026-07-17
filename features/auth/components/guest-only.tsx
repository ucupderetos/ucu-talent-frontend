"use client";

// Inverso de RoleGuard: envuelve las pantallas de (auth). Si ya hay sesión, no
// tiene sentido mostrar login/registro — te manda a la sección de tu rol.
//
// Un `error` del backend acá NO bloquea: si no podemos preguntar quién sos, lo
// razonable es dejarte ver el login igual, no dejarte encerrado afuera.

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { rutaInicialPara } from "@/lib/auth";

import { useSession } from "./session-provider";

export function GuestOnly({ children }: { children: React.ReactNode }) {
  const { usuario, cargando } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!cargando && usuario) router.replace(rutaInicialPara(usuario.rol));
  }, [cargando, usuario, router]);

  if (cargando) {
    return <Skeleton className="h-64 w-full max-w-sm" />;
  }

  // Redirigiendo a su sección: no parpadeamos el formulario de login.
  if (usuario) return null;

  return <>{children}</>;
}
