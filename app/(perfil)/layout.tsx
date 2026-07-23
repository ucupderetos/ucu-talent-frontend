// Layout del route group (perfil): sección de perfil COMPARTIDA entre alumno y
// empresa. Existe porque ambos roles usan la misma URL /perfil, y en el App
// Router de Next dos page.tsx de route groups distintos no pueden resolver a la
// misma ruta — así que el perfil no puede vivir dentro de (alumno) ni (empresa).
//
// RoleGuard con los dos roles (NO admin: el admin no tiene /perfil en su nav).
// ProfileGuard adentro, igual que (alumno)/(empresa): /completar-perfil sigue
// FUERA de los route groups, así que no hay loop de redirect.
//
// Delgado a propósito, y del equipo (no de un grupo de rol) — coordinar antes
// de tocarlo. Ver AGENTS.md, "Roles y control de acceso".

import { RoleGuard } from "@/features/auth/components/role-guard";
import { ProfileGuard } from "@/features/perfil/components/profile-guard";

export default function PerfilLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowed={["ALUMNO", "EMPRESA"]}>
      <ProfileGuard>{children}</ProfileGuard>
    </RoleGuard>
  );
}
