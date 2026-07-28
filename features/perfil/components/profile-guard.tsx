"use client";

// Red que atrapa a quien se registró pero se quedó sin perfil a mitad de
// camino (ver AGENTS.md, "Registro en dos pasos y ProfileGuard"): el alta
// real son 3 llamadas encadenadas (`POST /user` → `POST /auth/login` →
// `POST /student-profile`/`/company`), y `POST /auth/login` ya deja logueado
// aunque la última nunca se haya hecho (pestaña cerrada, error de red).
//
// Va DENTRO de `RoleGuard` — `(alumno)/layout.tsx` y `(empresa)/layout.tsx`
// lo montan como hijo, nunca `(admin)` (el admin no tiene este problema: su
// perfil se crea en la misma transacción que la cuenta, vía `/dev/admin`).
//
// ⚠️ TAMPOCO ES SEGURIDAD, igual que RoleGuard — es UX para no romper
// pantallas que asumen `studentProfileId`/`companyId` existente.

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useSession } from "@/hooks/use-session";

export function ProfileGuard({ children }: { children: React.ReactNode }) {
  const { hasProfile, isLoading, error } = useSession();
  const router = useRouter();

  useEffect(() => {
    // `RoleGuard` (el padre) ya validó que hay sesión y que el rol es el
    // correcto antes de renderizar esto — acá solo falta el perfil.
    if (isLoading || error) return;
    if (!hasProfile) router.replace("/completar-perfil");
  }, [isLoading, error, hasProfile, router]);

  // Mismo query que ya resolvió `RoleGuard` (TanStack Query dedupea por
  // queryKey), así que en la práctica esto no vuelve a mostrar loading — pero
  // si `ProfileGuard` se llega a usar solo, no queremos parpadear contenido
  // que asume perfil mientras se redirige.
  if (isLoading || error || !hasProfile) return null;

  return <>{children}</>;
}
