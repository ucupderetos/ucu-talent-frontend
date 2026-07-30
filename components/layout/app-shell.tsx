"use client";

// Shell de las secciones logueadas: navbar arriba, sidebar al costado (desktop),
// contenido al medio. Lo usan los layouts de (alumno), (empresa) y (admin).
//
// El route group le pasa el usuario ya validado. Este componente no decide
// permisos ni lee la sesión.
//
// ⚠️ PUNTO DE CONFLICTO entre los 3 grupos — coordinar antes de editar.

import { useState } from "react";

import { BreadcrumbProvider } from "@/components/layout/breadcrumb-context";
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
  const [collapsed, setCollapsed] = useState(false);

  function toggleCollapsed() {
    setCollapsed((prev) => !prev);
  }

  return (
    // Fila principal, no columna: el Sidebar es una columna propia que va de
    // punta a punta del viewport (h-dvh), así queda a la izquierda del navbar
    // en vez de debajo — el navbar ya no lo "tapa" por arriba. La columna de
    // la derecha (navbar + main) es la que scrollea; `main` con overflow-y-auto.
    <BreadcrumbProvider>
      {/* overflow-hidden: sin esto, cualquier desborde de 1px (redondeo del
          navegador, scrollbar, etc.) hace que el `body` mismo se vuelva
          scrolleable — al scrollear con el mouse sobre el sidebar/navbar (que
          no tienen su propio overflow) el navegador mueve el documento
          entero y se ve una franja blanca del fondo debajo de este shell,
          que es exactamente `h-dvh` (un viewport, ni un pixel más). */}
      <div className="flex h-dvh overflow-hidden">
        <Sidebar role={user.role} collapsed={collapsed} onToggleCollapsed={toggleCollapsed} />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Navbar user={user} />
          <main className="min-w-0 flex-1 overflow-y-auto overscroll-contain p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </BreadcrumbProvider>
  );
}
