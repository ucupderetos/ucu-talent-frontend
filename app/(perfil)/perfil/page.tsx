// Ruta: /perfil — perfil del usuario logueado, COMPARTIDA entre alumno y
// empresa. Una sola URL para los dos roles; la vista ramifica según el rol.
// Página delgada: toda la lógica vive en features/perfil/.

"use client";

import { useSession } from "@/hooks/use-session";
import { CompanyProfileView } from "@/features/perfil/components/company-profile-view";
import { StudentProfileView } from "@/features/perfil/components/student-profile-view";

export default function PerfilPage() {
  // RoleGuard (layout del route group) ya garantizó que hay sesión y que el rol
  // es ALUMNO o EMPRESA antes de montar esto: acá `user` nunca es null.
  const { user } = useSession();

  return user?.role === "EMPRESA" ? <CompanyProfileView /> : <StudentProfileView />;
}
