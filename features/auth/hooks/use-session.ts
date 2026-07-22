"use client";

// Sesión actual: quién es el usuario logueado.
//
// Existe porque el JWT va en una cookie httpOnly y el cliente no puede leerlo:
// el rol solo se sabe preguntándole al backend (GET /me).
//
// `MeResponse` no trae nombre (vive en el perfil del rol: `StudentProfile` /
// `Company` / `Admin`), así que acá se hace una segunda consulta encadenada
// para completar `name`/`surname` — así el resto de la app (Navbar, etc.)
// puede seguir recibiendo un solo `User` con nombre por props, sin tener que
// saber que en el wire son dos entidades separadas.
//
// No hace falta un Provider: TanStack Query deduplica por `queryKey`, así que
// aunque 10 componentes llamen useSession(), cada request se hace UNA vez y
// todos leen del mismo cache.

import { useQuery } from "@tanstack/react-query";

import { getCurrentUser, getDisplayProfile } from "@/lib/auth";
import type { User } from "@/types";

/** Query key de la sesión. Exportada para poder invalidarla al hacer login/logout. */
export const SESSION_QUERY_KEY = ["sesion"] as const;

interface Session {
  user: User | null;
  /** true mientras no sabemos todavía si hay sesión o no. */
  isLoading: boolean;
  /** Falla real del backend (500, red caída). Un 401 NO llega acá: es user null. */
  error: Error | null;
  /**
   * `false` cuando el `User` existe pero el perfil (`StudentProfile`/
   * `Company`) todavía no (`404` — se cortó a mitad del registro, ver
   * "Registro en dos pasos y ProfileGuard" en AGENTS.md). La usa
   * `ProfileGuard` para mandar a `/completar-perfil`. Sin sentido para
   * `ADMIN` (perfil se crea en la misma transacción que la cuenta) — no
   * chequear esto fuera de `(alumno)`/`(empresa)`.
   *
   * Igual que `user`, no confiar en este valor mientras `isLoading` es true.
   */
  hasProfile: boolean;
}

/**
 * Sesión actual. Tirá del `isLoading` antes de leer `user`: mientras es true,
 * `user: null` significa "todavía no sé", no "no hay nadie logueado".
 *
 * `user.name`/`user.surname` pueden llegar `undefined` un instante después de
 * que `user` ya no es `null` — la consulta del perfil se dispara recién cuando
 * se conoce el `userId`/`role`. `isLoading` sigue en `true` hasta que ambas
 * consultas resuelven, así que los consumidores no ven ese estado intermedio.
 */
export function useSession(): Session {
  const {
    data: identity,
    isPending: isIdentityLoading,
    error: identityError,
  } = useQuery({
    queryKey: SESSION_QUERY_KEY,
    queryFn: ({ signal }) => getCurrentUser(signal),
  });

  const {
    data: displayProfile,
    isPending: isProfileLoading,
    error: profileError,
  } = useQuery({
    queryKey: [...SESSION_QUERY_KEY, "perfil", identity?.userId],
    queryFn: ({ signal }) => getDisplayProfile(identity as User, signal),
    enabled: identity != null,
  });

  const error = identityError ?? (identity ? profileError : null);
  const isLoading = isIdentityLoading || (identity != null && isProfileLoading);

  const user: User | null = identity ? { ...identity, ...displayProfile } : null;

  return { user, isLoading, error, hasProfile: displayProfile != null };
}
