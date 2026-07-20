"use client";

// Barra superior. Compartida por los 3 roles.
//
// No lee la sesión: recibe el usuario por props. `components/layout/` es UI
// compartida sin lógica de dominio — quien sabe quién está logueado es el
// layout del route group, y se lo pasa para abajo.
//
// ⚠️ PUNTO DE CONFLICTO entre los 3 grupos — coordinar antes de editar.

import { LogOutIcon, MenuIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { NAV_BY_ROLE } from "@/components/layout/nav-items";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useLogout } from "@/features/auth/hooks/use-logout";
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

/** Iniciales para el fallback del avatar (sin foto todavía en el MER). */
function initials(user: User): string {
  return `${user.name.charAt(0)}${user.surname.charAt(0)}`.toUpperCase() || "?";
}

export function Navbar({ user }: { user: User | null }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const items = user ? NAV_BY_ROLE[user.role] : [];
  const logout = useLogout();

  return (
    // shrink-0: vive dentro de la columna navbar+main de AppShell, junto a un
    // `main` que scrollea — sin esto se achicaría si el contenido no entra.
    <header className="shrink-0 border-b bg-background">
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
          <div className="ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-auto min-w-0 gap-2 px-2 py-1.5"
                  aria-label="Cuenta"
                >
                  <Avatar size="sm">
                    <AvatarFallback>{initials(user)}</AvatarFallback>
                  </Avatar>
                  <span className="hidden max-w-40 truncate text-sm sm:inline">
                    {displayName(user)}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="flex flex-col gap-0.5 font-normal">
                  <span className="truncate text-sm font-medium text-foreground">
                    {displayName(user)}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  disabled={logout.isPending}
                  onSelect={() => logout.mutate()}
                >
                  <LogOutIcon />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </header>
  );
}
