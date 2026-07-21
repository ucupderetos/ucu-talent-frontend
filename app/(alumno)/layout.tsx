// Layout del route group (alumno): valida el rol antes de renderizar cualquier
// pantalla de /feed, /perfil o /postulaciones.
//
// `ProfileGuard` adentro de `RoleGuard`: atrapa al alumno que se registró
// (POST /user + POST /auth/login) pero nunca llegó a POST /student-profile —
// ver AGENTS.md, "Registro en dos pasos y ProfileGuard". Manda a
// /completar-perfil, que vive FUERA de este route group a propósito (si
// estuviera adentro, este mismo guard la redirigiría a sí misma en loop).
//
// Delgado a propósito: la lógica vive en RoleGuard/ProfileGuard. Este archivo
// es del equipo, no del grupo de alumno — coordinar antes de tocarlo.

import { RoleGuard } from "@/features/auth/components/role-guard";
import { ProfileGuard } from "@/features/perfil/components/ProfileGuard";

export default function AlumnoLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowed={["ALUMNO"]}>
      <ProfileGuard>{children}</ProfileGuard>
    </RoleGuard>
  );
}
