// Helpers de autenticación y sesión. Lógica pura, sin UI.
// El provider de React vive en features/auth/components/session-provider.tsx.
//
// ⚠️ ASUNCIÓN CLAVE: el JWT viaja en una cookie httpOnly seteada por Spring Boot.
// Consecuencia directa: el cliente NO puede leer el token ni el rol. Para saber
// quién es el usuario hay que preguntárselo al backend (GET /me). Si el equipo
// de backend termina eligiendo un token manejado en el cliente, este archivo y
// el `credentials: "include"` de api-client.ts son lo único que cambia.

import { ApiError, apiClient } from "@/lib/api-client";
import { USUARIOS_MOCK } from "@/lib/fixtures";
import type { Rol, User } from "@/types";

/**
 * ⚠️ PROVISORIO: el path real lo define el contrato de la API.
 * Es el endpoint que devuelve el usuario de la cookie de sesión.
 */
const ENDPOINT_USUARIO_ACTUAL = "/me";

/**
 * Modo desarrollo sin backend: NEXT_PUBLIC_MOCK_SESSION=alumno|empresa|admin
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
const ROL_MOCK = process.env.NEXT_PUBLIC_MOCK_SESSION;

function usuarioMock(): User | null {
  if (!ROL_MOCK) return null;
  if (ROL_MOCK in USUARIOS_MOCK) return USUARIOS_MOCK[ROL_MOCK as Rol];

  // Typo en .env.local: mejor gritar que fingir que no hay sesión y mandar a
  // login sin explicar por qué.
  throw new Error(
    `NEXT_PUBLIC_MOCK_SESSION="${ROL_MOCK}" no es un rol válido. Usá: alumno, empresa o admin.`,
  );
}

/**
 * Devuelve el usuario de la sesión actual, o `null` si no hay sesión.
 *
 * Un 401 NO es un error acá: es la respuesta esperada para "no logueado".
 * Cualquier otra falla (500, red caída) se propaga como ApiError, porque no
 * queremos mostrar la pantalla de login cuando en realidad se cayó el backend.
 */
export async function obtenerUsuarioActual(signal?: AbortSignal): Promise<User | null> {
  const mock = usuarioMock();
  if (mock) return mock;

  try {
    return await apiClient.get<User>(ENDPOINT_USUARIO_ACTUAL, { signal });
  } catch (error) {
    if (error instanceof ApiError && error.esNoAutenticado) return null;
    throw error;
  }
}

/** ¿Este rol puede entrar a una sección restringida a `permitidos`? */
export function puedeAcceder(rol: Rol | undefined, permitidos: readonly Rol[]): boolean {
  return rol !== undefined && permitidos.includes(rol);
}

/** Landing de cada rol después del login, y destino del redirect cuando alguien
 *  cae en una sección que no le corresponde. */
export const RUTA_INICIAL_POR_ROL: Record<Rol, string> = {
  alumno: "/feed",
  empresa: "/puestos",
  admin: "/moderacion",
};

export function rutaInicialPara(rol: Rol): string {
  return RUTA_INICIAL_POR_ROL[rol];
}
