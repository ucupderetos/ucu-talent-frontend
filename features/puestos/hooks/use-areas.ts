"use client";

// Catálogo de áreas — GET /area (docs/ENDPOINTS.md). Reemplaza a
// AREAS_PLACEHOLDER en job-basic-info-form.tsx (A-20, ya no pendiente).
//
// staleTime largo: las áreas son un catálogo casi estático (no cambia
// dentro de una sesión de uso normal), no hace falta refetchear seguido.

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import type { Area } from "@/types";

export function useAreas() {
  return useQuery({
    queryKey: ["areas"],
    queryFn: () => apiClient.get<Area[]>("/area"),
    staleTime: 5 * 60 * 1000, // 5 min
  });
}