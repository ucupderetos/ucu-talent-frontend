import { HomeRedirect } from "@/features/auth/components/home-redirect";

// `/` no es una pantalla: redirige según la sesión (a la sección del rol si hay
// login, a /login si no). Toda la lógica vive en `HomeRedirect`
// (`features/auth/`); la page solo compone.
export default function Home() {
  return <HomeRedirect />;
}
