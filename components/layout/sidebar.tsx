"use client";

// Navegación lateral. Solo desktop: en mobile los mismos items salen por el
// Sheet del Navbar, alimentados por la misma fuente (NAV_BY_ROLE).
//
// Colapsable a modo ícono (mismo comportamiento que el sidebar de referencia
// del equipo): el estado lo maneja `AppShell` y se lo pasa por props, así el
// toggle sobrevive a la navegación entre rutas (no se remonta el layout).
//
// ⚠️ PUNTO DE CONFLICTO entre los 3 grupos — coordinar antes de editar.

import { ChevronsLeftIcon, ChevronsRightIcon, LogOutIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { NAV_BY_ROLE } from "@/components/layout/nav-items";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useLogout } from "@/features/auth/hooks/use-logout";
import { cn } from "@/lib/utils";
import type { Role } from "@/types";

export function Sidebar({
  role,
  collapsed,
  onToggleCollapsed,
}: {
  role: Role;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}) {
  const pathname = usePathname();
  const items = NAV_BY_ROLE[role];
  const logout = useLogout();

  const logoutButton = (
    <button
      type="button"
      aria-label={collapsed ? "Cerrar sesión" : undefined}
      disabled={logout.isPending}
      onClick={() => logout.mutate()}
      className={cn(
        "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground disabled:pointer-events-none disabled:opacity-50",
        collapsed && "justify-center px-0",
      )}
    >
      <LogOutIcon className="size-4 shrink-0" />
      {!collapsed && (logout.isPending ? "Cerrando sesión..." : "Cerrar sesión")}
    </button>
  );

  return (
    <aside
      className={cn(
        "hidden h-full shrink-0 border-r border-sidebar-border bg-sidebar transition-[width] duration-200 md:block",
        collapsed ? "w-16" : "w-52",
      )}
    >
      <div className="flex h-full flex-col overflow-y-auto">
        {/* h-16: mismo alto que el header de Navbar, para que las líneas
            border-b de ambos queden alineadas a la misma altura. */}
        <div
          className={cn(
            "flex h-16 items-center border-b border-sidebar-border px-2",
            collapsed ? "justify-center" : "justify-between",
          )}
        >
          {!collapsed && (
            <Link href="/" className="flex min-w-0 items-center pl-1">
              <Image
                src="/logo-ucu-talent.png"
                alt="UCU talent"
                width={425}
                height={155}
                className="h-8 w-auto object-contain"
                priority
                unoptimized
              />
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
            aria-label={collapsed ? "Expandir menú" : "Contraer menú"}
            aria-pressed={collapsed}
            onClick={onToggleCollapsed}
          >
            {collapsed ? (
              <ChevronsRightIcon className="size-4" />
            ) : (
              <ChevronsLeftIcon className="size-4" />
            )}
          </Button>
        </div>

        <nav className="flex flex-col gap-1 p-2">
          {items.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const link = (
              <Link
                key={item.href}
                href={item.href}
                aria-label={collapsed ? item.label : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  collapsed && "justify-center px-0",
                  isActive
                    ? "bg-secondary-blue font-medium text-secondary-blue-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                )}
              >
                <item.icon className="size-4 shrink-0" />
                {!collapsed && item.label}
              </Link>
            );

            if (!collapsed) return link;

            return (
              <Tooltip key={item.href} delayDuration={200}>
                <TooltipTrigger asChild>{link}</TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            );
          })}
        </nav>

        {/* mt-auto: empuja el botón al fondo del sidebar sin importar cuántos
            items tenga NAV_BY_ROLE. */}
        <div className="mt-auto border-t border-sidebar-border p-2">
          {collapsed ? (
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>{logoutButton}</TooltipTrigger>
              <TooltipContent side="right">Cerrar sesión</TooltipContent>
            </Tooltip>
          ) : (
            logoutButton
          )}
        </div>
      </div>
    </aside>
  );
}
