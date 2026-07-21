// Layout del route group (empresa): valida el rol antes de renderizar.
//
// ⚠️ OJO: esto valida el ROL, no la aprobación de la empresa. RF-13 dice que la
// empresa necesita aprobación de Admin UCU antes de poder operar. Ya sabemos
// dónde vive ese dato: `User.status` (`AccountStatus`, ver `types/index.ts`),
// NO en `Company` — hay que pedir `GET /user/{companyId}` además de `GET /me`
// para leerlo (`MeResponse` sí trae `status`, así que en rigor ya está en
// `useSession()`; falta agregar acá el corte para `status !== "APROBADO"`).
// Sigue sin agregarse: no hay pantalla todavía que muestre "tu empresa está
// pendiente de aprobación", así que cortar acá dejaría a la empresa sin
// ningún mensaje. Agregar cuando exista esa pantalla.

import { RoleGuard } from "@/features/auth/components/role-guard";

export default function EmpresaLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowed={["EMPRESA"]}>{children}</RoleGuard>;
}
