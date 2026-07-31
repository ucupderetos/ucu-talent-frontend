// Helpers de autenticación y sesión. Lógica pura, sin UI ni React.
// El hook que consume esto es hooks/use-session.ts.
//
// Confirmado por docs/ENDPOINTS.md del backend: el login (`POST /auth/login`)
// setea un JWT en cookie httpOnly y `GET /me` devuelve `MeResponse`. El cliente
// no puede leer el token ni el rol directamente — la única forma de saber
// quién es el usuario es preguntándoselo al backend.

import { ApiError, apiClient } from "@/lib/api-client";
import type { Admin, Company, Role, StudentProfile, User } from "@/types";

const CURRENT_USER_ENDPOINT = "/me";

/**
 * Devuelve el usuario de la sesión actual (identidad pura, sin nombre), o
 * `null` si no hay sesión.
 *
 * Un 401 NO es un error acá: es la respuesta esperada para "no logueado".
 * Cualquier otra falla (500, red caída) se propaga como ApiError, porque no
 * queremos mostrar la pantalla de login cuando en realidad se cayó el backend.
 */
export async function getCurrentUser(signal?: AbortSignal): Promise<User | null> {
  try {
    return await apiClient.get<User>(CURRENT_USER_ENDPOINT, { signal });
  } catch (error) {
    if (error instanceof ApiError && error.isUnauthenticated) return null;
    throw error;
  }
}

/**
 * `MeResponse` no trae nombre — vive en el perfil del rol (`StudentProfile` /
 * `Company` / `Admin`, PK compartida con `User`). `useSession()` llama a esto
 * después de `getCurrentUser()` para completar `name`/`surname` y así
 * `components/layout/navbar.tsx` puede mostrar un nombre sin leer la sesión
 * él mismo (la recibe ya armada por props, vía RoleGuard → AppShell).
 *
 * Devuelve `{ name, surname }` con `surname` ausente para `EMPRESA` (el
 * `CompanyResponse` no tiene apellido — el nombre ahí es la razón social).
 *
 * Devuelve `null` (no lanza) si el perfil todavía no existe (`404`): es el
 * caso de una cuenta que se quedó a mitad del registro (`POST /user` +
 * `POST /auth/login` sin el `POST /student-profile`/`/company` final, ver
 * "Registro en dos pasos y ProfileGuard" en `docs/agents/roles-and-access-control.md`). `ProfileGuard`
 * (`features/perfil/components/`) usa esto para saber si mandar a
 * `/completar-perfil`.
 *
 * ⚠️ El recurso propio va por PATH param (`/student-profile/{id}`,
 * `/company/{id}`, `/admin/{id}` — PK compartida con `User`), NO por query
 * param (`?userId=`). Confirmado contra api-dev: una cuenta con perfil real
 * (`POST /student-profile` la había creado, `201`) daba `403` en
 * `/student-profile?userId=X` pero `200` con el perfil completo en
 * `/student-profile/X` — el query param no es una variante más laxa del
 * mismo endpoint, es una URL distinta que ni siquiera encuentra el recurso
 * del dueño. Con la forma vieja, ese `403` se colaba como `ApiError` real:
 * `useSession().error` quedaba en `true` y tanto `RoleGuard` (mensaje
 * genérico de "no pudimos verificar tu sesión") como `ProfileGuard` (corta
 * en `if (isLoading || error) return`, nunca redirige a
 * `/completar-perfil`) se quedaban trabados — la cuenta quedaba inutilizable
 * sin explicación, aunque el perfil existiera. El resto del código ya daba
 * esta forma por buena en otros dominios (`PUT /company/{id}`,
 * `GET /company/:id` en comentarios de `use-update-company-profile.ts` /
 * `use-vacancy.ts`) — acá era el único punto que todavía pegaba con
 * query param.
 */
export async function getDisplayProfile(
  user: User,
  signal?: AbortSignal,
): Promise<{ name: string; surname?: string } | null> {
  try {
    switch (user.role) {
      case "ALUMNO": {
        const profile = await apiClient.get<StudentProfile>(
          `/student-profile/${user.userId}`,
          { signal },
        );
        return { name: profile.name, surname: profile.surname };
      }
      case "EMPRESA": {
        const profile = await apiClient.get<Company>(`/company/${user.userId}`, { signal });
        return { name: profile.name };
      }
      case "ADMIN": {
        const profile = await apiClient.get<Admin>(`/admin/${user.userId}`, { signal });
        return { name: profile.name, surname: profile.surname };
      }
    }
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

/** ¿Este rol puede entrar a una sección restringida a `allowed`? */
export function canAccess(role: Role | undefined, allowed: readonly Role[]): boolean {
  return role !== undefined && allowed.includes(role);
}

/** Landing de cada rol después del login, y destino del redirect cuando alguien
 *  cae en una sección que no le corresponde.
 *  Las URLs quedan en español: son cara al usuario. */
const HOME_ROUTE_BY_ROLE: Record<Role, string> = {
  ALUMNO: "/feed",
  EMPRESA: "/puestos",
  // Las pantallas de admin cuelgan de /moderacion/*; se apunta directo al
  // dashboard, que es su portada, en vez de a /moderacion, que es un redirect.
  ADMIN: "/moderacion/dashboard",
};

export function homeRouteFor(role: Role): string {
  return HOME_ROUTE_BY_ROLE[role];
}
