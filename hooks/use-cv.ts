"use client";

// CV del alumno: de la key de storage a una URL que el browser pueda abrir.
//
// Vive en hooks/ (no en features/perfil/) porque lo consumen dos dominios: perfil
// (el alumno con su propio CV) y postulaciones (la empresa que mira a un
// postulante). Mismo criterio —y mismo diseño de dos pasos— que
// `hooks/use-profile-image.ts`. Las MUTACIONES (subir/reemplazar/borrar) sí son
// solo del dueño, así que se quedan en `features/perfil/hooks/use-cv.ts`.
//
// ⚠️ Son DOS pasos, no uno (verificado contra el código fuente del backend,
// `StudentProfileController`/`StudentProfileServiceImpl` — ninguna versión de
// ENDPOINTS.md lo documenta):
//
//   1. `StudentProfileResponse.cvFile` (`GET /student-profile/{id}`) trae la
//      **key** del objeto en el storage (`student-profiles/cv/{id}.pdf`), no una
//      URL.
//   2. `GET /student-profile/cv?cvFile={key}` la canjea por una URL firmada de
//      Google Cloud Storage, devuelta como texto plano.
//
// ⚠️ El paso 2 **no valida rol ni ownership** (A-25 de
// `docs/agents/open-questions.md`, reportado a backend): `getCvFile` solo
// chequea que exista algún perfil con esa key y que el token no esté vencido,
// así que cualquier autenticado con la key obtiene la URL. No lo puede arreglar
// el front — se documenta acá para que nadie lo tome como garantía de acceso.

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";

/** Key de la URL firmada. Se discrimina por la key de storage, no por alumno:
 *  al reemplazar el CV cambia la key, así que la URL vieja no se reusa. */
export function cvUrlQueryKey(objectKey: string) {
  return ["cv-alumno", objectKey] as const;
}

/**
 * La URL firmada expira: el backend la firma con el tiempo que le queda al token
 * de sesión (techo de 7 días, límite del firmado V4 de GCS). Cinco minutos de
 * `staleTime` evitan refirmar en cada montaje sin arriesgar servir una URL
 * vencida desde el cache. Mismo criterio que la foto de perfil.
 */
const SIGNED_URL_STALE_TIME = 5 * 60 * 1000;

/**
 * Canjea la key de storage por su URL firmada. Con `objectKey` vacío/`null`/
 * `undefined` no dispara nada y devuelve `null` — "este alumno no subió CV" no
 * es un error.
 */
export function useCvUrl(objectKey: string | null | undefined): {
  cvUrl: string | null;
  isLoading: boolean;
  /** Hay un CV subido (la key existe) pero el backend no pudo darnos una URL
   *  para abrirlo. Ver el aviso del 503, abajo. */
  isUnavailable: boolean;
} {
  const query = useQuery({
    queryKey: cvUrlQueryKey(objectKey ?? ""),
    queryFn: ({ signal }) =>
      apiClient.get<string>("/student-profile/cv", {
        params: { cvFile: objectKey! },
        signal,
      }),
    enabled: Boolean(objectKey),
    staleTime: SIGNED_URL_STALE_TIME,
    // Sin reintentos, a diferencia del default global (que sí reintenta en 5xx).
    // ⚠️ Verificado el 2026-07-30: hoy `api-dev` devuelve `503` ("El
    // almacenamiento de archivos no está configurado en este entorno") en TODO
    // lo que necesite firmar una URL — es el mismo `catch` de
    // `StorageServiceImpl.getSignedUrl` que ya rompe la foto de perfil. La
    // subida funciona; lo que falla es el canje. El 503 es determinístico, así
    // que reintentar solo multiplica requests fallidas.
    retry: false,
  });

  return {
    cvUrl: query.data ?? null,
    // Sin key no hay nada que cargar: `isPending` de una query deshabilitada
    // queda en true para siempre y dejaría un Skeleton perpetuo.
    isLoading: Boolean(objectKey) && query.isPending,
    isUnavailable: query.isError,
  };
}
