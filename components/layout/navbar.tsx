"use client";

// Barra superior. Compartida por los 3 roles.
//
// No lee la sesión: recibe el usuario por props. `components/layout/` es UI
// compartida sin lógica de dominio — quien sabe quién está logueado es el
// layout del route group, y se lo pasa para abajo.
//
// ⚠️ PUNTO DE CONFLICTO entre los 3 grupos — coordinar antes de editar.

import { MenuIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { NAV_POR_ROL } from "@/components/layout/nav-items";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { User } from "@/types";

export function Navbar({ usuario }: { usuario: User | null }) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const pathname = usePathname();
  const items = usuario ? NAV_POR_ROL[usuario.rol] : [];

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="flex h-14 items-center gap-2 px-4">
        {items.length > 0 && (
          <Sheet open={menuAbierto} onOpenChange={setMenuAbierto}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Abrir menú"
              >
                <MenuIcon className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SheetTitle className="sr-only">Navegación</SheetTitle>
              <nav className="flex flex-col gap-1 p-4 pt-12">
                {items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuAbierto(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm",
                      pathname.startsWith(item.href)
                        ? "bg-accent font-medium text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent/50",
                    )}
                  >
                    <item.icono className="size-4 shrink-0" />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        )}

        <Link href="/" className="font-semibold tracking-tight">
          UCU Talent
        </Link>

        {usuario && (
          <div className="ml-auto flex min-w-0 items-center gap-3">
            <span className="hidden truncate text-sm text-muted-foreground sm:inline">
              {usuario.nombre}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
