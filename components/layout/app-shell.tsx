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
    // punta a punta del viewport, así queda a la izquierda del navbar en vez
    // de debajo — el navbar ya no lo "tapa" por arriba. La columna de la
    // derecha (navbar + main) es la que scrollea; `main` con overflow-y-auto.
    <BreadcrumbProvider>
      {/* `fixed` + `h-dvh`, las dos cosas — cada una resuelve un problema
          distinto y ninguna sola alcanza:

          - `fixed` (con `inset-x-0 top-0`): saca el shell del flujo. Con el
            shell en flujo, cualquier desborde de 1px (redondeo de `100dvh` en
            Chrome, scrollbar) vuelve scrolleable al propio `body`, y al
            scrollear sobre el sidebar/navbar (que no tienen overflow propio)
            el navegador mueve el documento entero y aparece una franja blanca
            del fondo debajo del shell. Un elemento fixed no cuenta para el
            overflow scrolleable del documento, así que eso no puede pasar.
          - `h-dvh`: define el alto explícitamente. Si dejáramos `inset-0`, el
            alto lo daría el bloque contenedor inicial, que los navegadores
            móviles dimensionan distinto según la barra de URL y NO se achica
            con el teclado virtual — un input al final de un form largo puede
            quedar tapado sin forma de scrollear. `100dvh` sí acompaña.

          overflow-hidden adentro sigue evitando que el contenido de
          sidebar/navbar desborde este contenedor. */}
      <div className="fixed inset-x-0 top-0 flex h-dvh overflow-hidden">
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
