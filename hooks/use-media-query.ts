"use client";

import { useEffect, useState } from "react";

/**
 * `true` cuando el `media query` matchea el viewport actual. Pensado para
 * ELEGIR qué layout montar (renderizar uno u otro), no para ocultar/mostrar con
 * CSS — para eso están las utilidades responsive de Tailwind (`lg:` etc.).
 *
 * Cuándo usar esto y no `hidden lg:block` / `lg:hidden`: cuando montar los dos
 * layouts a la vez trae problemas reales —IDs de formulario duplicados en el
 * DOM, estado local duplicado que se desincroniza—, no solo peso de más. Al
 * elegir un solo árbol, se monta el contenido una sola vez.
 *
 * SSR: devuelve `false` en el server (no hay `window`); en el cliente lee el
 * valor real desde el primer render (initializer con guarda) para no parpadear.
 * Es seguro contra hydration mientras el contenido que depende del valor no se
 * renderice en el HTML del server (en la práctica: pantallas CSR detrás de un
 * estado de carga, como el perfil).
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false,
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);

    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}
