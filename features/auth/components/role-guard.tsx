"use client";

// Guard de rol + shell de las secciones logueadas. Lo usan los layout.tsx de
// (alumno), (empresa) y (admin) — un solo lugar, mismo comportamiento en los 3.
//
// ⚠️ ESTO NO ES SEGURIDAD. Es UX: evita que alguien vea una pantalla que no le
// corresponde. Un usuario puede saltearlo con las devtools. La autorización real
// la hace Spring Boot, que tiene que rechazar toda request que no corresponda
// sin importar lo que haga el frontend.
//
// Es la ÚNICA capa de redirect del front: hubo un `proxy.ts` que hacía el mismo
// chequeo del lado del server, pero se borró (no puede leer la cookie de sesión,
// que vive en el dominio de la API, y causaba un loop de redirección que rompía
// el login). Ver `docs/agents/roles-and-access-control.md`, "El acceso se valida en tres capas".

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/hooks/use-session";
import { canAccess, homeRouteFor } from "@/lib/auth";
import type { Role } from "@/types";

export function RoleGuard({
  allowed,
  children,
}: {
  allowed: readonly Role[];
  children: React.ReactNode;
}) {
  const { user, isLoading, error } = useSession();
  const router = useRouter();
  const authorized = canAccess(user?.role, allowed);

  useEffect(() => {
    if (isLoading || error) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!authorized) {
      // Está logueado pero en la sección equivocada: lo mandamos a la suya.
      router.replace(homeRouteFor(user.role));
    }
  }, [isLoading, error, user, authorized, router]);

  if (isLoading) return <LoadingSkeleton />;

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

  // Redirigiendo: mismo skeleton que loading, no dejamos la pantalla en
  // blanco mientras el useEffect dispara el redirect.
  if (!user || !authorized) return <LoadingSkeleton />;

  return <AppShell user={user}>{children}</AppShell>;
}

function LoadingSkeleton() {
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
