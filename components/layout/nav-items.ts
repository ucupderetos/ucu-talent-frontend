// Items de navegación por rol. Fuente única: si una sección cambia de URL, se
// toca acá y se actualizan navbar y sidebar juntos.
//
// ⚠️ PUNTO DE CONFLICTO entre los 3 grupos — coordinar antes de editar.

import {
  BriefcaseIcon,
  FileTextIcon,
  NewspaperIcon,
  ShieldCheckIcon,
  UserIcon,
  type LucideIcon,
} from "lucide-react";

import type { Rol } from "@/types";

export interface NavItem {
  label: string;
  href: string;
  icono: LucideIcon;
}

export const NAV_POR_ROL: Record<Rol, readonly NavItem[]> = {
  alumno: [
    { label: "Feed", href: "/feed", icono: NewspaperIcon },
    { label: "Mis postulaciones", href: "/postulaciones", icono: FileTextIcon },
    { label: "Mi perfil", href: "/perfil", icono: UserIcon },
  ],
  empresa: [
    // ⚠️ /puestos todavía no tiene page.tsx — lo crea el grupo de empresa.
    { label: "Mis puestos", href: "/puestos", icono: BriefcaseIcon },
  ],
  admin: [{ label: "Moderación", href: "/moderacion", icono: ShieldCheckIcon }],
};
