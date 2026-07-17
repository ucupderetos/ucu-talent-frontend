// Layout del route group (empresa): valida el rol antes de renderizar.
//
// ⚠️ OJO: esto valida el ROL, no la aprobación de la empresa. RF-13 dice que la
// empresa necesita aprobación de Admin UCU antes de poder operar, y ese gate es
// sobre la empresa (`Company.approved` en el MER), no sobre el rol. Falta definir
// con el backend cómo llega ese booleano al frontend —¿viene en GET /me?— y
// agregar acá el corte para la empresa no aprobada.

import { RoleGuard } from "@/features/auth/components/role-guard";

export default function EmpresaLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowed={["company"]}>{children}</RoleGuard>;
}
