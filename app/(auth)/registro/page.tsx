// Ruta: /registro — alta de alumno (RF-AUT-01/02).

import { AuthHeader, AuthHeaderSkeleton } from "@/features/auth/components/AuthLayout";
import { GuestOnly } from "@/features/auth/components/guest-only";
import {
  RegisterForm,
  RegisterFormSkeleton,
} from "@/features/auth/components/RegisterForm";

export default function RegistroPage() {
  return (
    <GuestOnly
      fallback={
        <>
          <AuthHeaderSkeleton />
          <RegisterFormSkeleton />
        </>
      }
    >
      <AuthHeader
        title="Creá tu cuenta"
        subtitle="Registrate con tu cédula para acceder al portal laboral."
      />
      <RegisterForm />
    </GuestOnly>
  );
}
