"use client";

// hook que trae las empresas pendientes de aprobacion. por ahora las saca
// del mock (data/), cuando este el back se cambia por el fetch y ya.

import { useQuery } from "@tanstack/react-query";

import {
  EMPRESAS_PENDIENTES_MOCK,
  type EmpresaPendienteRow,
} from "@/features/moderacion/data/validaciones-mock";

async function getEmpresasPendientes(): Promise<EmpresaPendienteRow[]> {
  return EMPRESAS_PENDIENTES_MOCK;
}

interface ValidacionesResult {
  empresas: EmpresaPendienteRow[];
  isLoading: boolean;
  error: Error | null;
}

export function useValidaciones(): ValidacionesResult {
  const { data, isPending, error } = useQuery({
    queryKey: ["validaciones"],
    queryFn: getEmpresasPendientes,
  });

  return {
    empresas: data ?? [],
    isLoading: isPending,
    error,
  };
}
