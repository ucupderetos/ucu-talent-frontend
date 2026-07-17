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

import { obtenerUsuarioActual } from "@/lib/auth";
import type { User } from "@/types";

/** Query key de la sesión. Exportada para poder invalidarla al hacer login/logout. */
export const SESSION_QUERY_KEY = ["sesion"] as const;

interface Sesion {
  usuario: User | null;
  /** true mientras no sabemos todavía si hay sesión o no. */
  cargando: boolean;
  /** Falla real del backend (500, red caída). Un 401 NO llega acá: es usuario null. */
  error: Error | null;
}

/**
 * Sesión actual. Tirá del `cargando` antes de leer `usuario`: mientras es true,
 * `usuario: null` significa "todavía no sé", no "no hay nadie logueado".
 */
export function useSession(): Sesion {
  const { data, isPending, error } = useQuery({
    queryKey: SESSION_QUERY_KEY,
    queryFn: ({ signal }) => obtenerUsuarioActual(signal),
  });

  return {
    usuario: data ?? null,
    cargando: isPending,
    error,
  };
}
