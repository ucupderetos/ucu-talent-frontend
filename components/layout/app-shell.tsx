// Shell de las secciones logueadas: navbar arriba, sidebar al costado (desktop),
// contenido al medio. Lo usan los layouts de (alumno), (empresa) y (admin).
//
// El route group le pasa el usuario ya validado. Este componente no decide
// permisos ni lee la sesión.
//
// ⚠️ PUNTO DE CONFLICTO entre los 3 grupos — coordinar antes de editar.

import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import type { User } from "@/types";

export function AppShell({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <Navbar user={user} />
      <div className="flex flex-1">
        <Sidebar role={user.role} />
        <main className="min-w-0 flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
