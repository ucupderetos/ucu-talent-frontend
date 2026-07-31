// Ruta: /login — pantalla de inicio de sesión.

import { AuthHeader } from "@/features/auth/components/auth-layout";
import { GuestOnly } from "@/features/auth/components/guest-only";
import { LoginForm, LoginFormSkeleton } from "@/features/auth/components/login-form";

// El título/bajada NO dependen de la sesión — se muestran de inmediato, sin
// esperar el `GET /me` de `GuestOnly` (si el backend está lento/en cold start,
// eso podía dejar la pantalla en blanco varios segundos antes de mostrar
// "Bienvenido"). Solo el formulario (que sí puede terminar redirigiendo) va
// adentro del guard.
export default function LoginPage() {
  return (
    <>
      <AuthHeader
        title="Bienvenido"
        subtitle="Ingresá tu email y contraseña para acceder al portal laboral."
      />
      <GuestOnly fallback={<LoginFormSkeleton />}>
        <LoginForm />
      </GuestOnly>
    </>
  );
}
