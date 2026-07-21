// Helpers de autenticación y sesión. Lógica pura, sin UI ni React.
// El hook que consume esto es features/auth/hooks/use-session.ts.
//
// Confirmado por docs/ENDPOINTS.md del backend: el login (`POST /auth/login`)
// setea un JWT en cookie httpOnly y `GET /me` devuelve `MeResponse`. El cliente
// no puede leer el token ni el rol directamente — la única forma de saber
// quién es el usuario es preguntándoselo al backend.

import { ApiError, apiClient } from "@/lib/api-client";
import { MOCK_USERS } from "@/lib/fixtures";
import type { Admin, Company, Role, StudentProfile, User } from "@/types";

const CURRENT_USER_ENDPOINT = "/me";

/**
 * Modo desarrollo sin backend: NEXT_PUBLIC_MOCK_SESSION=ALUMNO|EMPRESA|ADMIN
 * saltea el GET /me y devuelve un usuario de fixtures.
 *
 * Existe porque, sin esto, no hay backend → falla /me → RoleGuard bloquea toda
 * ruta protegida y ningún grupo puede ver sus pantallas. Poné el rol de tu
 * grupo en .env.local y trabajá.
 *
 * 🔴 BORRAR cuando exista el backend. No es seguridad: solo cambia lo que el
 * frontend CREE que sos. Spring Boot no lo mira, así que en producción un
 * usuario que se lo setee no gana ningún permiso — pero igual no queremos este
 * código vivo cuando ya no haga falta.
 */
const MOCK_ROLE = process.env.NEXT_PUBLIC_MOCK_SESSION;

function mockUser(): User | null {
  if (!MOCK_ROLE) return null;
  if (MOCK_ROLE in MOCK_USERS) return MOCK_USERS[MOCK_ROLE as Role];

  // Typo en .env.local: mejor gritar que fingir que no hay sesión y mandar a
  // login sin explicar por qué.
  throw new Error(
    `NEXT_PUBLIC_MOCK_SESSION="${MOCK_ROLE}" no es un rol válido. Usá: ALUMNO, EMPRESA o ADMIN.`,
  );
}

/**
 * Devuelve el usuario de la sesión actual (identidad pura, sin nombre), o
 * `null` si no hay sesión.
 *
 * Un 401 NO es un error acá: es la respuesta esperada para "no logueado".
 * Cualquier otra falla (500, red caída) se propaga como ApiError, porque no
 * queremos mostrar la pantalla de login cuando en realidad se cayó el backend.
 */
export async function getCurrentUser(signal?: AbortSignal): Promise<User | null> {
  const mock = mockUser();
  if (mock) return mock;

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
 * "Registro en dos pasos y ProfileGuard" en AGENTS.md). `ProfileGuard`
 * (`features/perfil/components/`) usa esto para saber si mandar a
 * `/completar-perfil`.
 */
export async function getDisplayProfile(
  user: User,
  signal?: AbortSignal,
): Promise<{ name: string; surname?: string } | null> {
  if (MOCK_ROLE) return { name: user.name ?? "", surname: user.surname };

  try {
    switch (user.role) {
      case "ALUMNO": {
        const profile = await apiClient.get<StudentProfile>("/student-profile", {
          params: { userId: user.userId },
          signal,
        });
        return { name: profile.name, surname: profile.surname };
      }
      case "EMPRESA": {
        const profile = await apiClient.get<Company>("/company", {
          params: { userId: user.userId },
          signal,
        });
        return { name: profile.name };
      }
      case "ADMIN": {
        const profile = await apiClient.get<Admin>("/admin", {
          params: { userId: user.userId },
          signal,
        });
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
export const HOME_ROUTE_BY_ROLE: Record<Role, string> = {
  ALUMNO: "/feed",
  EMPRESA: "/puestos",
  ADMIN: "/moderacion",
};

export function homeRouteFor(role: Role): string {
  return HOME_ROUTE_BY_ROLE[role];
}
