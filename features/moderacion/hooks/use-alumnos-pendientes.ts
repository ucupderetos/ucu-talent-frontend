"use client";

// hook que trae los alumnos pendientes de aprobacion. por ahora los saca
// del mock (data/), cuando este el back se cambia por el fetch y ya.

import { useQuery } from "@tanstack/react-query";

import {
  ALUMNOS_PENDIENTES_MOCK,
  type AlumnoPendienteRow,
} from "@/features/moderacion/data/alumnos-pendientes-mock";

async function getAlumnosPendientes(): Promise<AlumnoPendienteRow[]> {
  return ALUMNOS_PENDIENTES_MOCK;
}

interface AlumnosPendientesResult {
  alumnos: AlumnoPendienteRow[];
  isLoading: boolean;
  error: Error | null;
}

export function useAlumnosPendientes(): AlumnosPendientesResult {
  const { data, isPending, error } = useQuery({
    queryKey: ["alumnos-pendientes"],
    queryFn: getAlumnosPendientes,
  });

  return {
    alumnos: data ?? [],
    isLoading: isPending,
    error,
  };
}
