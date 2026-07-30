// Layout del route group (empresa): valida el rol antes de renderizar.
//
// ⚠️ OJO: esto valida el ROL, no el `AccountStatus` de la empresa. RF-MOD-04
// dice que la empresa necesita aprobación de Admin UCU antes de **publicar**
// (no antes de entrar) — el gate real va en el punto de acción ("publicar
// puesto"), no acá. Ver `docs/agents/roles-and-access-control.md`.
//
// `ProfileGuard` adentro de `RoleGuard`: atrapa a la empresa que se registró
// pero nunca llegó a POST /company — ver `docs/agents/roles-and-access-control.md`,
// "Registro en dos pasos y ProfileGuard". Manda a /completar-perfil, que vive FUERA de este route
// group a propósito (si estuviera adentro, este mismo guard la redirigiría a
// sí misma en loop).

import { RoleGuard } from "@/features/auth/components/role-guard";
import { ProfileGuard } from "@/features/perfil/components/profile-guard";

export default function EmpresaLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowed={["EMPRESA"]}>
      <ProfileGuard>{children}</ProfileGuard>
    </RoleGuard>
  );
}
