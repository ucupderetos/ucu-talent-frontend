"use client";

// Layout del wizard de creación de oferta. Envuelve los 3 pasos
// (informacion-basica, detalles-del-puesto, revision) con el form
// compartido, para que sobreviva a la navegación entre ellos.
//
// RN-02 / RF-MOD-04: la empresa necesita `AccountStatus.APROBADO` para
// publicar puestos. El layout padre (empresa) ya valida el ROL, no el
// estado — este guard cubre el caso de URL directa (`/crear-oferta/...`),
// como red de contención del gate real que ya bloquea el botón "Crear nueva
// oferta" en `company-vacancies-view.tsx`. ⚠️ Esto NO es seguridad, es UX
// (mismo criterio que `RoleGuard`/`ProfileGuard`) — la autorización real la
// hace Spring Boot.

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/hooks/use-session";
import { CreateJobFormProvider } from "@/features/puestos/hooks/use-create-job-form";

export default function CrearOfertaLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useSession();
  const router = useRouter();
  const canCreateOffer = user?.status === "APROBADO";

  useEffect(() => {
    if (isLoading || !user || canCreateOffer) return;
    router.replace("/puestos");
  }, [isLoading, user, canCreateOffer, router]);

  if (isLoading || !user) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // Redirigiendo: no parpadeamos el wizard para una empresa que no puede usarlo.
  if (!canCreateOffer) return null;

  return <CreateJobFormProvider>{children}</CreateJobFormProvider>;
}
