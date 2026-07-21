"use client";

// hook que trae las postulaciones. por ahora las saca del mock (data/),
// cuando este el back se cambia getPostulaciones por el fetch y ya.

import { useQuery } from "@tanstack/react-query";

import {
  POSTULACIONES_MOCK,
  type PostulacionRow,
} from "@/features/moderacion/data/postulaciones-mock";

async function getPostulaciones(): Promise<PostulacionRow[]> {
  return POSTULACIONES_MOCK;
}

interface PostulacionesResult {
  postulaciones: PostulacionRow[];
  isLoading: boolean;
  error: Error | null;
}

export function usePostulaciones(): PostulacionesResult {
  const { data, isPending, error } = useQuery({
    queryKey: ["postulaciones"],
    queryFn: getPostulaciones,
  });

  return {
    postulaciones: data ?? [],
    isLoading: isPending,
    error,
  };
}
