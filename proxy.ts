// Guard optimista de sesión (Next 16 renombró Middleware a Proxy — ver
// AGENTS.md, "En Next 16 middleware.ts ya no existe: ahora es proxy.ts").
//
// ⚠️ ESTO NO ES SEGURIDAD. Solo puede leer la cookie, nunca pegarle a la API
// ni a la base — el doc de Next es explícito: Proxy "no está pensado como
// solución completa de manejo de sesión ni de autorización". La autorización
// real la hace Spring Boot, que rechaza toda request que no corresponda sin
// importar lo que haga el frontend. `RoleGuard`/`ProfileGuard` (client-side)
// son la segunda capa, tampoco seguridad — ver "El acceso se valida en tres
// capas" en AGENTS.md.
//
// Lo único que hace: si una ruta protegida no tiene la cookie de sesión,
// redirige a /login antes de que se renderice nada (más rápido que esperar a
// que `RoleGuard` monte y recién ahí redirija). Si la cookie está pero es
// inválida/vencida, esto no lo detecta — eso lo resuelve `GET /me` (401) y
// `RoleGuard` como ya hacía.
//
// Nombre de la cookie confirmado contra el código fuente del backend
// (`auth/AuthController.java`, `auth/CookieBearerTokenResolver.java`, rama
// `dev`): `access_token`, `httpOnly`, `secure`, `sameSite=None` — resuelve
// A-16 en AGENTS.md.
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE_NAME = "access_token";

export function proxy(request: NextRequest) {
  if (request.cookies.has(SESSION_COOKIE_NAME)) return NextResponse.next();

  return NextResponse.redirect(new URL("/login", request.url));
}

// Rutas protegidas de los 5 route groups logueados ((alumno), (empresa),
// (admin), (perfil)) más /completar-perfil (fuera de los groups a propósito,
// ver AGENTS.md). NO incluye "/", "/login" ni "/registro": son públicas
// ((auth) usa `GuestOnly`, y "/" ya resuelve los dos casos con `HomeRedirect`
// sin necesitar el gate acá).
export const config = {
  matcher: [
    "/feed/:path*",
    "/postulaciones/:path*",
    "/puestos/:path*",
    "/perfil/:path*",
    "/moderacion/:path*",
    "/postulantes/:path*",
    "/crear-oferta/:path*",
    "/completar-perfil/:path*",
  ],
};
