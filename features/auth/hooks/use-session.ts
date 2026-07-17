"use client";

// Sesión actual: quién es el usuario logueado.
//
// Existe porque el JWT va en una cookie httpOnly y el cliente no puede leerlo:
// el rol solo se sabe preguntándole al backend (GET /me).
//
// No hace falta un Provider: TanStack Query deduplica por `queryKey`, así que
// aunque 10 componentes llamen useSession(), el GET /me se hace UNA vez y todos
// leen del mismo cache.

import { useQuery } from "@tanstack/react-query";

import { getCurrentUser } from "@/lib/auth";
import type { User } from "@/types";

/** Query key de la sesión. Exportada para poder invalidarla al hacer login/logout. */
export const SESSION_QUERY_KEY = ["session"] as const;

interface Session {
  user: User | null;
  /** true mientras no sabemos todavía si hay sesión o no. */
  isLoading: boolean;
  /** Falla real del backend (500, red caída). Un 401 NO llega acá: es user null. */
  error: Error | null;
}

/**
 * Sesión actual. Tirá del `isLoading` antes de leer `user`: mientras es true,
 * `user: null` significa "todavía no sé", no "no hay nadie logueado".
 */
export function useSession(): Session {
  const { data, isPending, error } = useQuery({
    queryKey: SESSION_QUERY_KEY,
    queryFn: ({ signal }) => getCurrentUser(signal),
  });

  return {
    user: data ?? null,
    isLoading: isPending,
    error,
  };
}
