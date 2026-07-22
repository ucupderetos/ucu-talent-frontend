// Layout del route group (auth): login y registro.
//
// No lleva AppShell — todavía no sabemos quién es el usuario, así que no hay
// navbar ni sidebar que mostrar. El shell visual (panel de marca + columna)
// se renderiza siempre acá, ANTES de saber si hay sesión: así no hay salto de
// layout mientras se resuelve la sesión.
//
// GuestOnly vive en cada page.tsx (no acá) porque el skeleton que muestra
// mientras carga tiene que mirarse como el formulario real de esa pantalla —
// login y registro no tienen los mismos campos.

import { AuthLayout } from "@/features/auth/components/auth-layout";

export default function AuthRouteLayout({ children }: { children: React.ReactNode }) {
  return <AuthLayout>{children}</AuthLayout>;
}
