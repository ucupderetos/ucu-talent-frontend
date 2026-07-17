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

import { NAV_BY_ROLE } from "@/components/layout/nav-items";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { User } from "@/types";

/**
 * El MER separa `name` y `surname`.
 * ⚠️ Para una empresa, `name` es el nombre de la empresa (`Company` no tiene
 * campo propio de nombre) y no está claro qué trae `surname`.
 * TODO: confirmar con backend — si viene vacío, el trim() lo cubre.
 */
function displayName(user: User): string {
  return `${user.name} ${user.surname}`.trim();
}

export function Navbar({ user }: { user: User | null }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const items = user ? NAV_BY_ROLE[user.role] : [];

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="flex h-14 items-center gap-2 px-4">
        {items.length > 0 && (
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
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
            <SheetContent side="left" className="w-64 bg-sidebar p-0 text-sidebar-foreground">
              <SheetTitle className="sr-only">Navegación</SheetTitle>
              <nav className="flex flex-col gap-1 p-4 pt-12">
                {items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm",
                      pathname.startsWith(item.href)
                        ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                    )}
                  >
                    <item.icon className="size-4 shrink-0" />
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

        {user && (
          <div className="ml-auto flex min-w-0 items-center gap-3">
            <span className="hidden truncate text-sm text-muted-foreground sm:inline">
              {displayName(user)}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
