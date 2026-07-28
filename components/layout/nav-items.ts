// Items de navegación por rol. Fuente única: si una sección cambia de URL, se
// toca acá y se actualizan navbar y sidebar juntos.
//
// ⚠️ PUNTO DE CONFLICTO entre los 3 grupos — coordinar antes de editar.
//
// ⚠️ NINGÚN `href` puede ser prefijo de otro. El item activo se resuelve por
// prefijo en tres lugares (`sidebar.tsx`, y dos veces en `navbar.tsx`), así que
// un href padre se traga a sus hijos: resalta dos items a la vez en el sidebar
// y, en el navbar, `items.find` devuelve el padre con `isNested = true` — o sea
// que el header queda esperando un `usePageBreadcrumb` que la pantalla no llama
// y muestra un Skeleton para siempre. Por eso las pantallas de admin cuelgan
// todas de `/moderacion/*` y ninguna se queda con `/moderacion` a secas.

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
