// Ruta: /login — pantalla de inicio de sesión.

import { AuthHeader, AuthHeaderSkeleton } from "@/features/auth/components/AuthLayout";
import { GuestOnly } from "@/features/auth/components/guest-only";
import { LoginForm, LoginFormSkeleton } from "@/features/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <GuestOnly
      fallback={
        <>
          <AuthHeaderSkeleton />
          <LoginFormSkeleton />
        </>
      }
    >
      <AuthHeader
        title="Bienvenido"
        subtitle="Ingresá tu email y contraseña para acceder al portal laboral."
      />
      <LoginForm />
    </GuestOnly>
  );
}
