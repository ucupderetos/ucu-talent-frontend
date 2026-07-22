// Layout del route group (admin): valida el rol antes de renderizar /moderacion.
//
// Delgado a propósito: la lógica vive en RoleGuard. Este archivo es del equipo,
// no del grupo de admin — coordinar antes de tocarlo.

import { RoleGuard } from "@/features/auth/components/role-guard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowed={["ADMIN"]}>{children}</RoleGuard>;
}
