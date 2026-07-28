"use client";

// Ruta: /completar-perfil — paso 3 del registro (POST /student-profile o
// /company), reintentado con sesión ya activa. Ver AGENTS.md, "Registro en
// dos pasos y ProfileGuard".
//
// FUERA de los route groups a propósito: si viviera dentro de (alumno) o
// (empresa), su propio `ProfileGuard` la redirigiría a sí misma en loop. Por
// eso valida rol acá mismo con `RoleGuard`, en vez de heredarlo de un layout.

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { RoleGuard } from "@/features/auth/components/role-guard";
import { useSession } from "@/hooks/use-session";
import { CompleteProfileForm } from "@/features/perfil/components/complete-profile-form";
import { homeRouteFor } from "@/lib/auth";
import type { Role } from "@/types";

export default function CompletarPerfilPage() {
  return (
    <RoleGuard allowed={["ALUMNO", "EMPRESA"]}>
      <CompletarPerfilContent />
    </RoleGuard>
  );
}

function CompletarPerfilContent() {
  const { user, hasProfile, isLoading } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Ya tiene perfil: no hay nada que completar acá — lo mandamos a su home.
    if (!isLoading && hasProfile && user) router.replace(homeRouteFor(user.role));
  }, [isLoading, hasProfile, user, router]);

  if (isLoading || hasProfile || !user) return null;

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Completá tu perfil</h1>
        <p className="text-muted-foreground">
          Nos falta esto para que puedas usar la plataforma.
        </p>
      </div>
      <CompleteProfileForm role={user.role as Extract<Role, "ALUMNO" | "EMPRESA">} />
    </div>
  );
}
