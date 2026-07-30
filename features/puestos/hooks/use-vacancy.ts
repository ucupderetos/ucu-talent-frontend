"use client";

// Detalle de una vacante (vista alumno) — RF-PUE.
//
// ⚠️ docs/ENDPOINTS.md (ninguna versión, ni la local ni la del backend)
// documenta esto: `GET /vacancy/{id}/resolved` es un endpoint agregado, mismo
// criterio que A-22/A-26 (`.../management`, `.../me/detailed`) — resuelve
// `vacancy` + `company` + `areaName`/`parentAreaName` en una sola llamada, en
// vez de las tres separadas (`GET /vacancy/{id}` + `GET /company/{companyId}`
// + `GET /area`) que armaba este hook antes.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient, ApiError } from "@/lib/api-client";
import type { VacancyDetail, VacancyResolvedResponse } from "@/features/puestos/types";
import type { VacancyApplication } from "@/types";

/** @public para invalidación puntual futura (`docs/agents/data-fetching.md`). */
export function vacancyQueryKey(vacancyId: string) {
  return ["puestos", vacancyId] as const;
}

export function useVacancy(vacancyId: string) {
  return useQuery({
    queryKey: vacancyQueryKey(vacancyId),
    queryFn: () => fetchVacancy(vacancyId),
  });
}

async function fetchVacancy(vacancyId: string): Promise<VacancyDetail | null> {
  const resolved = await apiClient.get<VacancyResolvedResponse>(`/vacancy/${vacancyId}/resolved`);

  return {
    ...resolved.vacancy,
    company: resolved.company,
    areaName: resolved.areaName ?? "—",
    parentAreaName: resolved.parentAreaName,
  };
}

/**
 * RN-05: un alumno no puede postularse dos veces a la misma vacante.
 *
 * `GET /vacancy-application/me` es el mismo endpoint que arma "Mis
 * postulaciones" (`features/postulaciones/hooks/use-my-applications.ts`) —
 * se pega directo acá en vez de importar el hook de ese dominio (regla de
 * `docs/agents/agent-rules.md`: no importar entre `features/`).
 *
 * ⚠️ Antes esto usaba la MISMA queryKey que `useMyApplications`
 * (`["postulaciones", "mias", studentProfileId]`) a propósito, para que
 * TanStack Query dedupe el fetch. Se revierte: los dos hooks cachean shapes
 * DISTINTAS bajo esa key (acá, el array crudo de `{ vacancyId }`; en
 * `useMyApplications`, `MyApplicationRow[]` ya resuelto con `vacancy`/
 * `companyName`/`areaName`) — Query no sabe que son incompatibles, así que
 * si este hook puebla el cache primero (ej. se visitó el detalle de una
 * vacante y después "Mis postulaciones"), la pantalla de postulaciones lee
 * el array crudo como si fuera `MyApplicationRow[]` y explota con
 * `Cannot read properties of undefined (reading 'areaId')` (encontrado en QA
 * manual del flujo de alumno). Se agrega un sufijo para que la key sea
 * DISTINTA — el prefijo `["postulaciones", "mias", studentProfileId]` sigue
 * siendo el mismo, así que el `invalidateQueries` de `useApplyToVacancy` de
 * abajo (que invalida por ese prefijo) sigue refrescando las dos pantallas.
 */
export function useHasApplied(vacancyId: string, studentProfileId: string | undefined) {
  const query = useQuery({
    queryKey: ["postulaciones", "mias", studentProfileId, "vacancyIds"] as const,
    queryFn: () => apiClient.get<{ vacancyId: string }[]>("/vacancy-application/me"),
    enabled: studentProfileId != null,
  });

  return query.data?.some((application) => application.vacancyId === vacancyId) ?? false;
}

/** @public para invalidación puntual futura (`docs/agents/data-fetching.md`). */
export function vacancyApplicantsQueryKey(vacancyId: string) {
  return ["puestos", vacancyId, "postulantes"] as const;
}

/**
 * Cantidad de postulaciones de una vacante — la usa `EditVacancyView` para el
 * gate de "campos editables solo sin postulaciones". Wire:
 * `GET /vacancy-application?vacancyId={id}` (Empresa dueña,
 * `VacancyApplicantResponse[]`, docs/ENDPOINTS.md) — mismo endpoint que ya
 * usa `use-company-vacancies.ts` para la columna "Postulantes" de la tabla,
 * pero acá alcanza con el conteo de una sola vacante.
 *
 * `enabled` lo controla el llamador: el endpoint es solo para la empresa
 * dueña, así que no tiene sentido pedirlo antes de confirmar el ownership.
 *
 * ⚠️ Expone `isError` a propósito: es un gate de negocio (A-06), así que un
 * conteo desconocido (falló el fetch) NO puede caer silenciosamente en "0
 * postulantes" — el llamador (`EditVacancyView`) tiene que bloquear la
 * edición en vez de asumir que no hay postulaciones.
 */
export function useVacancyApplicantsCount(vacancyId: string, enabled: boolean) {
  const query = useQuery({
    queryKey: vacancyApplicantsQueryKey(vacancyId),
    queryFn: () =>
      apiClient.get<VacancyApplication[]>("/vacancy-application", {
        params: { vacancyId },
      }),
    enabled,
  });

  return {
    count: query.data?.length ?? 0,
    isLoading: enabled ? query.isLoading : false,
    isError: enabled ? query.isError : false,
  };
}

/**
 * Postularse a una vacante — RF-POS-01. Wire: `POST /vacancy-application`.
 *
 * ⚠️ El body es `{ vacancyId, studentProfileId }`, NO solo `{ vacancyId }`
 * como decía una versión anterior de este comentario (basada en
 * `docs/ENDPOINTS.md`, que no lo documentaba así). Verificado contra el
 * código fuente del backend (`CreateVacancyApplicationRequest.java`):
 * `studentProfileId` es `@NotBlank` en el DTO — el controller lo pisa con el
 * del token antes de usarlo (`vacancyapplication/VacancyApplicationController.create`),
 * pero la validación del body corre ANTES de esa lógica, así que omitirlo
 * hace fallar la request con `400` igual, aunque el valor en sí sea
 * decorativo. Mandamos `studentProfileId` real (no un string vacío) para no
 * depender de esa asimetría.
 *
 * Requiere ALUMNO + cuenta `APROBADO` + vacante `PUBLICADO` + al menos un
 * registro de `Education` — los primeros dos ya los resuelve el gate de
 * RN-16 en `ApplyAction` (`vacancy-detail-view.tsx`); el de la vacante lo
 * resuelve ese mismo componente al ocultar el botón si no está `PUBLICADO`;
 * el de educación no se valida en el front (A-07 seguía abierto, y esto lo
 * resuelve: el backend SÍ lo exige) — si falta, el mensaje de error de acá
 * abajo ya lo explica con el texto real del backend.
 *
 * Vive acá (dominio `puestos`) por el mismo motivo que `useHasApplied`: es
 * la única pantalla que la dispara, y así se evita el import cruzado hacia
 * `features/postulaciones`.
 */
export function useApplyToVacancy(vacancyId: string, studentProfileId: string | undefined) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () =>
      apiClient.post<VacancyApplication>("/vacancy-application", {
        vacancyId,
        studentProfileId,
      }),
    onSuccess: () => {
      // Invalida por PREFIJO: matchea tanto la key de `useHasApplied` arriba
      // (que le agrega el sufijo "vacancyIds") como la de `useMyApplications`
      // (features/postulaciones/hooks/use-my-applications.ts) — las dos
      // pantallas se actualizan solas con una sola invalidación.
      queryClient.invalidateQueries({ queryKey: ["postulaciones", "mias", studentProfileId] });
    },
  });

  const apiError = mutation.error instanceof ApiError ? mutation.error : null;

  return {
    apply: mutation.mutateAsync,
    isLoading: mutation.isPending,
    // Un 409 acá puede ser tres cosas distintas (ya postulado, vacante no
    // PUBLICADO, o sin registros de Education) — ya NO se asume que siempre
    // es "ya postulado". `apiError.message` trae el `detail` real del
    // backend (ver A-19, lib/api-client.ts), así que se muestra tal cual en
    // vez de adivinar cuál de los tres pasó.
    error: mutation.isError
      ? (apiError?.message ?? "No se pudo enviar la postulación. Intentá nuevamente.")
      : null,
  };
}
