// Layout del route group (auth): login y registro.
//
// No lleva AppShell — todavía no sabemos quién es el usuario, así que no hay
// navbar ni sidebar que mostrar. Solo centra el contenido.

import { GuestOnly } from "@/features/auth/components/guest-only";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <GuestOnly>{children}</GuestOnly>
      </div>
    </div>
  );
}
