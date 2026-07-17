"use client";

// Provider de sesión: resuelve "quién es el usuario logueado" una sola vez y lo
// comparte con toda la app.
//
// Existe porque el JWT va en una cookie httpOnly: el cliente no puede leer el
// token, así que el rol solo se sabe preguntándole al backend (GET /me). Sin
// esto, cada componente que necesite el rol dispararía su propio request.
//
// ⚠️ Implementado con useEffect + useState porque la decisión de TanStack Query
// está pendiente. Si entra Query, se reemplaza el cuerpo de este archivo por un
// useQuery y NINGÚN consumidor de useSession() se entera. Por eso el fetch vive
// acá y no desparramado en los componentes.

import { createContext, useContext, useEffect, useState } from "react";

import { obtenerUsuarioActual } from "@/lib/auth";
import type { User } from "@/types";

interface Sesion {
  usuario: User | null;
  /** true mientras no sabemos todavía si hay sesión o no. */
  cargando: boolean;
  /** Falla real del backend (500, red caída). Un 401 NO llega acá: es usuario null. */
  error: Error | null;
}

const SesionContext = createContext<Sesion | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [sesion, setSesion] = useState<Sesion>({
    usuario: null,
    cargando: true,
    error: null,
  });

  useEffect(() => {
    const controller = new AbortController();

    obtenerUsuarioActual(controller.signal)
      .then((usuario) => setSesion({ usuario, cargando: false, error: null }))
      .catch((error: unknown) => {
        // El abort del cleanup no es un error que mostrarle a nadie.
        if (error instanceof DOMException && error.name === "AbortError") return;
        setSesion({
          usuario: null,
          cargando: false,
          error: error instanceof Error ? error : new Error(String(error)),
        });
      });

    return () => controller.abort();
  }, []);

  return <SesionContext.Provider value={sesion}>{children}</SesionContext.Provider>;
}

/**
 * Sesión actual. Tirá del `cargando` antes de leer `usuario`: mientras es true,
 * `usuario: null` significa "todavía no sé", no "no hay nadie logueado".
 */
export function useSession(): Sesion {
  const contexto = useContext(SesionContext);
  if (contexto === undefined) {
    throw new Error("useSession() tiene que usarse adentro de <SessionProvider>.");
  }
  return contexto;
}
