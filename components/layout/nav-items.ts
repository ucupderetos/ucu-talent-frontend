// Items de navegación por rol. Fuente única: si una sección cambia de URL, se
// toca acá y se actualizan navbar y sidebar juntos.
//
// ⚠️ PUNTO DE CONFLICTO entre los 3 grupos — coordinar antes de editar.

import {
  BriefcaseIcon,
  BuildingIcon,
  FileTextIcon,
  NewspaperIcon,
  PlusIcon,
  ShieldCheckIcon,
  UserIcon,
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
    { label: "Perfil de empresa", href: "/perfil", icon: BuildingIcon },
    { label: "Crear oferta", href: "/crear-oferta/informacion-basica", icon: PlusIcon },
  ],
  ADMIN: [{ label: "Moderación", href: "/moderacion", icon: ShieldCheckIcon }],
};
