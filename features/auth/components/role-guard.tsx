"use client";

// Guard de rol + shell de las secciones logueadas. Lo usan los layout.tsx de
// (alumno), (empresa) y (admin) — un solo lugar, mismo comportamiento en los 3.
//
// ⚠️ ESTO NO ES SEGURIDAD. Es UX: evita que alguien vea una pantalla que no le
// corresponde. Un usuario puede saltearlo con las devtools. La autorización real
// la hace Spring Boot, que tiene que rechazar toda request que no corresponda
// sin importar lo que haga el frontend. Ver también proxy.ts (chequeo optimista).

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/features/auth/hooks/use-session";
import { puedeAcceder, rutaInicialPara } from "@/lib/auth";
import type { Rol } from "@/types";

export function RoleGuard({
  permitidos,
  children,
}: {
  permitidos: readonly Rol[];
  children: React.ReactNode;
}) {
  const { usuario, cargando, error } = useSession();
  const router = useRouter();
  const autorizado = puedeAcceder(usuario?.rol, permitidos);

  useEffect(() => {
    if (cargando || error) return;
    if (!usuario) {
      router.replace("/login");
      return;
    }
    if (!autorizado) {
      // Está logueado pero en la sección equivocada: lo mandamos a la suya.
      router.replace(rutaInicialPara(usuario.rol));
    }
  }, [cargando, error, usuario, autorizado, router]);

  if (cargando) return <EsqueletoDeCarga />;

  // Falla real del backend. Mandarlo a /login sería mentirle: no es que no esté
  // logueado, es que no pudimos preguntar.
  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
        <p className="font-medium">No pudimos verificar tu sesión.</p>
        <p className="text-sm text-muted-foreground">
          Revisá tu conexión y volvé a intentar.
        </p>
      </div>
    );
  }

  // Redirigiendo: no parpadeamos contenido que no corresponde.
  if (!usuario || !autorizado) return null;

  return <AppShell usuario={usuario}>{children}</AppShell>;
}

function EsqueletoDeCarga() {
  return (
    <div className="flex flex-1 flex-col">
      <Skeleton className="h-14 w-full rounded-none" />
      <div className="flex flex-1">
        <Skeleton className="hidden h-full w-56 rounded-none md:block" />
        <div className="flex-1 space-y-4 p-4 md:p-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </div>
  );
}
