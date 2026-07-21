"use client";

// hook que trae los usuarios. por ahora los saca del mock (data/), cuando
// este el back se cambia getUsuarios por el fetch y ya.

import { useQuery } from "@tanstack/react-query";

import { USUARIOS_MOCK, type UsuarioRow } from "@/features/moderacion/data/usuarios-mock";

async function getUsuarios(): Promise<UsuarioRow[]> {
  return USUARIOS_MOCK;
}

interface UsuariosResult {
  usuarios: UsuarioRow[];
  isLoading: boolean;
  error: Error | null;
}

export function useUsuarios(): UsuariosResult {
  const { data, isPending, error } = useQuery({
    queryKey: ["usuarios"],
    queryFn: getUsuarios,
  });

  return {
    usuarios: data ?? [],
    isLoading: isPending,
    error,
  };
}
