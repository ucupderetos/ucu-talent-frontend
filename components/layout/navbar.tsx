"use client";

// Barra superior. Compartida por los 3 roles.
//
// No lee la sesión: recibe el usuario por props. `components/layout/` es UI
// compartida sin lógica de dominio — quien sabe quién está logueado es el
// layout del route group, y se lo pasa para abajo.
//
// ⚠️ PUNTO DE CONFLICTO entre los 3 grupos — coordinar antes de editar.

import { ChevronDownIcon, ChevronRightIcon, LogOutIcon, MenuIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { useBreadcrumbLabel } from "@/components/layout/breadcrumb-context";
import { NAV_BY_ROLE, findActiveNavItem } from "@/components/layout/nav-items";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useLogout } from "@/hooks/use-logout";
import { useProfileImage } from "@/hooks/use-profile-image";
import { cn } from "@/lib/utils";
import type { User } from "@/types";

/**
 * `User.name`/`User.surname` los completa `useSession()` con una segunda
 * consulta al perfil del rol (no vienen en `MeResponse`) — pueden llegar
 * `undefined` un instante antes de resolver. Para `EMPRESA`, `name` es la
 * razón social y no hay `surname` (`CompanyResponse` no lo tiene).
 */
function displayName(user: User): string {
  return [user.name, user.surname].filter(Boolean).join(" ");
}

/** Iniciales para el fallback del avatar: sin foto subida, o mientras se
 *  resuelve su URL firmada. */
function initials(user: User): string {
  return `${user.name?.charAt(0) ?? ""}${user.surname?.charAt(0) ?? ""}`.toUpperCase() || "?";
}

export function Navbar({ user }: { user: User | null }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const items = user ? NAV_BY_ROLE[user.role] : [];
  const logout = useLogout();
  const breadcrumbLabel = useBreadcrumbLabel();
  // Sigue sin leer la sesión: el userId llega por props (`user`), igual que el
  // nombre. `useProfileImage` es infra app-wide de `hooks/`, como `useLogout`.
  //
  // ADMIN queda afuera a propósito: no tiene pantalla de perfil (el RoleGuard de
  // (perfil)/layout.tsx solo deja ALUMNO y EMPRESA), así que nunca puede subir
  // una foto y `profileImage` siempre viene null. Pedirla igual serían dos
  // requests por montaje —`GET /user/{id}` y el canje de la URL firmada— para
  // terminar siempre en las iniciales. Es la decisión del equipo del 2026-07-30:
  // el admin no lleva foto.
  const { imageUrl } = useProfileImage(user?.role === "ADMIN" ? null : user?.userId);

  const activeItem = findActiveNavItem(items, pathname);
  const isNested = Boolean(activeItem && pathname !== activeItem.href);

  return (
    // shrink-0: vive dentro de la columna navbar+main de AppShell, junto a un
    // `main` que scrollea — sin esto se achicaría si el contenido no entra.
    <header className="shrink-0 border-b bg-background">
      <div className="flex h-16 items-center gap-2 px-4">
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
              <div className="flex h-16 items-center border-b border-sidebar-border px-4">
                <Image
                  src="/logo-ucu-talent.png"
                  alt="UCU talent"
                  width={425}
                  height={155}
                  className="h-8 w-auto object-contain"
                  unoptimized
                />
              </div>
              <nav className="flex flex-col gap-1 p-4">
                {items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm",
                      item.href === activeItem?.href
                        ? "bg-secondary-blue font-medium text-secondary-blue-foreground"
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

        {activeItem ? (
          isNested ? (
            // Breadcrumb "Sección > Ítem": la sección es link, el ítem actual
            // va en negrita y sin link (AGENTS.md — "Header dinámico +
            // breadcrumb"). El nombre del ítem lo pone la propia página de
            // detalle vía `usePageBreadcrumb`.
            <nav aria-label="Ruta actual" className="flex min-w-0 items-center gap-1.5">
              <Link
                href={activeItem.href}
                className="flex shrink-0 items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
              >
                <activeItem.icon className="size-4 shrink-0" />
                <span className="hidden sm:inline">{activeItem.label}</span>
              </Link>
              {/* El ítem actual: Skeleton mientras carga (`undefined`). Si el
                  dato resolvió sin nombre (`null` — vacante no encontrada o
                  error) se omite el separador y el ítem, y queda solo la
                  sección como link — nunca un Skeleton perpetuo. */}
              {breadcrumbLabel !== null && (
                <>
                  <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
                  {breadcrumbLabel === undefined ? (
                    <Skeleton className="h-5 w-24 shrink-0" />
                  ) : (
                    <span className="truncate font-semibold tracking-tight text-foreground">
                      {breadcrumbLabel}
                    </span>
                  )}
                </>
              )}
            </nav>
          ) : (
            // `h1` y no `div`: el nombre de la sección ES el título de la
            // pantalla. Las páginas no lo repiten en su contenido (ver el
            // comentario de PageHeader), así que si acá no fuera un heading el
            // documento quedaría sin `h1` para lectores de pantalla. Solo
            // cambia la semántica: las clases son las mismas de antes.
            <h1 className="flex min-w-0 items-center gap-2 font-semibold tracking-tight">
              <activeItem.icon className="size-5 shrink-0 text-muted-foreground" />
              <span className="truncate">{activeItem.label}</span>
            </h1>
          )
        ) : (
          <Link href="/" className="font-semibold tracking-tight">
            UCU Talent
          </Link>
        )}

        {user && (
          <div className="ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-auto min-w-0 gap-2 px-2 py-1.5 hover:bg-transparent aria-expanded:bg-transparent dark:hover:bg-transparent"
                  aria-label="Cuenta"
                >
                  <Avatar size="sm">
                    {imageUrl && <AvatarImage src={imageUrl} alt="" />}
                    <AvatarFallback>{initials(user)}</AvatarFallback>
                  </Avatar>
                  <span className="hidden max-w-40 truncate text-sm sm:inline">
                    {displayName(user)}
                  </span>
                  <ChevronDownIcon className="hidden size-4 shrink-0 text-muted-foreground sm:inline" />
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
