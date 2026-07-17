// Layout del route group (alumno): valida el rol antes de renderizar cualquier
// pantalla de /feed, /perfil o /postulaciones.
//
// Delgado a propósito: la lógica vive en RoleGuard. Este archivo es del equipo,
// no del grupo de alumno — coordinar antes de tocarlo.

import { RoleGuard } from "@/features/auth/components/role-guard";

export default function AlumnoLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowed={["student"]}>{children}</RoleGuard>;
}
