// Items de navegación por rol. Fuente única: si una sección cambia de URL, se
// toca acá y se actualizan navbar y sidebar juntos.
//
// ⚠️ PUNTO DE CONFLICTO entre los 3 grupos — coordinar antes de editar.
//
// El item activo lo resuelve `findActiveNavItem` (abajo), la única
// implementación del repo: la usan `sidebar.tsx` y `navbar.tsx` (breadcrumb y
// Sheet mobile). Antes cada uno hacía su propio `pathname.startsWith(href)` y
// habían divergido entre sí.

import {
  BriefcaseIcon,
  BuildingIcon,
  FileTextIcon,
  LayoutDashboardIcon,
  NewspaperIcon,
  PlusIcon,
  ShieldCheckIcon,
  UserCheckIcon,
  UserIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";

import type { Role } from "@/types";

export interface NavItem {
  /** Los labels y las URLs quedan en español: son cara al usuario. */
  label: string;
  href: string;
  icon: LucideIcon;
}

export const NAV_BY_ROLE: Record<Role, readonly NavItem[]> = {
  ALUMNO: [
    { label: "Vacantes", href: "/feed", icon: NewspaperIcon },
    { label: "Mis postulaciones", href: "/postulaciones", icon: FileTextIcon },
    { label: "Mi perfil", href: "/perfil", icon: UserIcon },
  ],
  EMPRESA: [
    { label: "Mis puestos", href: "/puestos", icon: BriefcaseIcon },
    { label: "Crear oferta", href: "/crear-oferta", icon: PlusIcon },
    { label: "Postulantes", href: "/postulantes", icon: UsersIcon },
    { label: "Perfil de empresa", href: "/perfil", icon: BuildingIcon },
  ],
  ADMIN: [
    { label: "Centro de Gestión", href: "/moderacion/dashboard", icon: LayoutDashboardIcon },
    { label: "Validaciones", href: "/moderacion/validaciones", icon: UserCheckIcon },
    { label: "Empresas", href: "/moderacion/empresas", icon: BuildingIcon },
    { label: "Estudiantes", href: "/moderacion/estudiantes", icon: UsersIcon },
    { label: "Postulaciones", href: "/moderacion/postulaciones", icon: FileTextIcon },
    { label: "Ofertas", href: "/moderacion/ofertas", icon: ShieldCheckIcon },
  ],
};

/**
 * ¿Esta ruta cae dentro de esta sección? Match exacto, o ruta anidada debajo
 * del item (`/puestos/123/postulantes` cae en `/puestos`).
 *
 * La barra final es lo que hace que sea el segmento y no el texto: sin ella,
 * `/perfil` matchearía también `/perfil-empresa`, que es otra sección.
 */
function matchesNavItem(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * El item de nav activo para una ruta, o `undefined` si ninguno la cubre.
 *
 * **Gana el match más específico** (el `href` más largo de los que matchean).
 * Eso es lo que permite que un href padre y sus hijos convivan en el mismo
 * menú: estando en `/moderacion/ofertas`, un item `/moderacion` matchea igual,
 * pero pierde contra el hijo. Sin este criterio, el padre se los tragaba —
 * resaltaba dos items a la vez en el sidebar y, en el navbar, devolvía el padre
 * con `isNested = true`, dejando el header esperando un `usePageBreadcrumb` que
 * la pantalla nunca llama (Skeleton para siempre).
 */
export function findActiveNavItem(
  items: readonly NavItem[],
  pathname: string,
): NavItem | undefined {
  let active: NavItem | undefined;

  for (const item of items) {
    if (!matchesNavItem(pathname, item.href)) continue;
    if (!active || item.href.length > active.href.length) active = item;
  }

  return active;
}
