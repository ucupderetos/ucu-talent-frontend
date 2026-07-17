"use client";

// Navegación lateral. Solo desktop: en mobile los mismos items salen por el
// Sheet del Navbar, alimentados por la misma fuente (NAV_POR_ROL).
//
// ⚠️ PUNTO DE CONFLICTO entre los 3 grupos — coordinar antes de editar.

import Link from "next/link";
import { usePathname } from "next/navigation";

import { NAV_POR_ROL } from "@/components/layout/nav-items";
import { cn } from "@/lib/utils";
import type { Rol } from "@/types";

export function Sidebar({ rol }: { rol: Rol }) {
  const pathname = usePathname();
  const items = NAV_POR_ROL[rol];

  return (
    <aside className="hidden w-56 shrink-0 border-r md:block">
      <nav className="sticky top-14 flex flex-col gap-1 p-4">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
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
    </aside>
  );
}
