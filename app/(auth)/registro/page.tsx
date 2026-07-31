// Ruta: /registro — alta de alumno (RF-AUT-01/02).

import { AuthHeader } from "@/features/auth/components/auth-layout";
import { GuestOnly } from "@/features/auth/components/guest-only";
import {
  RegisterForm,
  RegisterFormSkeleton,
} from "@/features/auth/components/register-form";

// Mismo criterio que /login: el título no depende de la sesión, se muestra
// de inmediato en vez de esperar el `GET /me` de `GuestOnly`.
export default function RegistroPage() {
  return (
    <>
      <AuthHeader
        title="Creá tu cuenta"
        subtitle="Registrate con tu cédula para acceder al portal laboral."
      />
      <GuestOnly fallback={<RegisterFormSkeleton />}>
        <RegisterForm />
      </GuestOnly>
    </>
  );
}
