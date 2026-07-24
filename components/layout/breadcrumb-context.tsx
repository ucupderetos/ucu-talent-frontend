"use client";

// Estado del breadcrumb del Navbar (título "Sección > Ítem" en pantallas de
// detalle anidadas — ver AGENTS.md, "Header dinámico + breadcrumb").
//
// Vive en components/layout/ sin lógica de dominio: el Navbar solo sabe leer
// un string. Es la propia página de detalle (en features/<dominio>/) la que
// llama a `usePageBreadcrumb(label)` con el nombre real del ítem (ej. el
// título de una vacante) — así la dependencia sigue yendo features/ →
// components/, nunca al revés.
//
// ⚠️ PUNTO DE CONFLICTO entre los 3 grupos — coordinar antes de editar.

import { createContext, useContext, useEffect, useState } from "react";

// Tres estados, y hay que distinguirlos: `undefined` = cargando (el Navbar
// muestra un Skeleton), `null` = resuelto pero sin nombre (ej. la vacante no
// existe o falló el fetch — el Navbar omite el ítem y deja solo la sección),
// `string` = el nombre del ítem. Aplanar `undefined` y `null` al mismo valor
// dejaba el header en Skeleton para siempre cuando el dato daba error.
type BreadcrumbLabel = string | null | undefined;

interface BreadcrumbContextValue {
  label: BreadcrumbLabel;
  setLabel: (label: BreadcrumbLabel) => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextValue | null>(null);

export function BreadcrumbProvider({ children }: { children: React.ReactNode }) {
  const [label, setLabel] = useState<BreadcrumbLabel>(undefined);

  return (
    <BreadcrumbContext.Provider value={{ label, setLabel }}>{children}</BreadcrumbContext.Provider>
  );
}

export function useBreadcrumbLabel() {
  const ctx = useContext(BreadcrumbContext);
  if (!ctx) throw new Error("useBreadcrumbLabel debe usarse dentro de AppShell");
  return ctx.label;
}

/**
 * Llamar desde una página de detalle anidada (ej. el detalle de una vacante)
 * con el nombre del ítem actual. `undefined` mientras el dato todavía está
 * cargando (el Navbar muestra un `Skeleton`); `null` si el dato resolvió pero
 * no hay nombre —error o no encontrado— (el Navbar omite el ítem y deja solo
 * la sección). Limpia el label al desmontar, para que no quede pegado al
 * navegar a otra sección.
 */
export function usePageBreadcrumb(label: BreadcrumbLabel) {
  const ctx = useContext(BreadcrumbContext);
  if (!ctx) throw new Error("usePageBreadcrumb debe usarse dentro de AppShell");
  const { setLabel } = ctx;

  useEffect(() => {
    setLabel(label);
    return () => setLabel(undefined);
  }, [label, setLabel]);
}
