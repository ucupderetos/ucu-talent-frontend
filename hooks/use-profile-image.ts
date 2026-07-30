"use client";

// Foto de perfil: de la key de storage a una URL que el browser pueda mostrar.
//
// Vive en hooks/ (no en features/perfil/) porque lo consumen el Navbar
// (components/layout/, que no puede importar de features/) y dos dominios
// distintos — perfil (la propia) y postulaciones (la del postulante que ve la
// empresa). Mismo criterio que el resto de la capa de sesión.
//
// ⚠️ Son DOS pasos, no uno, y ninguna version de docs/ENDPOINTS.md lo documenta
// (verificado contra el codigo fuente del backend):
//
//   1. `UserResponse.profileImage` (`GET /user/{id}`) trae la **key** del objeto
//      en el storage, no una URL. `MeResponse` NO la trae.
//   2. `GET /user/profile-image?profileObject={key}` la canjea por una URL
//      firmada de Google Cloud Storage, devuelta como texto plano.
//
// El path del GET es `/user/profile-image` (con guion) aunque el PATCH y el
// DELETE sean `/user/profile/image` (con barra). No es un typo de este archivo:
// el backend los tiene asi.

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import type { User } from "@/types";

/** Key del `User` completo. Exportada para invalidarla al cambiar la foto. */
export function userQueryKey(userId: string) {
  return ["usuario", userId] as const;
}

/** Key de la URL firmada. Se discrimina por la key de storage, no por usuario:
 *  al reemplazar la foto cambia la key, así que la URL vieja no se reusa. */
export function profileImageUrlQueryKey(objectKey: string) {
  return ["imagen-perfil", objectKey] as const;
}

/**
 * La URL firmada expira: el backend la firma con el tiempo que le queda al
 * token de sesión (con un techo de 7 días, límite del firmado V4 de GCS). Cinco
 * minutos de `staleTime` es un punto medio — evita refirmar en cada montaje sin
 * arriesgar servir una URL vencida desde el cache.
 */
const SIGNED_URL_STALE_TIME = 5 * 60 * 1000;

/**
 * Paso 2 solo: canjea una key de storage por su URL firmada. Para quien ya
 * tiene el `User` en mano (ej. el detalle de un postulante, que ya pide
 * `GET /user/{id}` para el email) y no necesita una consulta extra.
 *
 * Con `objectKey` vacío/`null`/`undefined` no dispara nada y devuelve `null` —
 * el caso "este usuario no tiene foto", que no es un error.
 */
export function useSignedProfileImageUrl(objectKey: string | null | undefined): {
  imageUrl: string | null;
  isLoading: boolean;
  /** Hay una imagen subida (la key existe) pero el backend no pudo darnos una
   *  URL para mostrarla. Ver el aviso sobre el 503, abajo. */
  isUnavailable: boolean;
} {
  const query = useQuery({
    queryKey: profileImageUrlQueryKey(objectKey ?? ""),
    queryFn: ({ signal }) =>
      apiClient.get<string>("/user/profile-image", {
        params: { profileObject: objectKey! },
        signal,
      }),
    enabled: Boolean(objectKey),
    staleTime: SIGNED_URL_STALE_TIME,
    // Sin reintentos, a diferencia del default global (que sí reintenta en 5xx).
    // ⚠️ Verificado contra api-dev el 2026-07-30: este endpoint devuelve `503`
    // con detail "El almacenamiento de archivos no está configurado en este
    // entorno" — es el `catch` de `StorageServiceImpl.getSignedUrl`. La subida a
    // GCS funciona, pero firmar la URL necesita una clave privada de service
    // account que el entorno no tiene, así que el 503 es determinístico:
    // reintentar solo multiplica requests fallidas (3 por montaje, y esto se
    // monta en el Navbar y en la pantalla de perfil a la vez). Cuando infra lo
    // configure, esta línea no molesta: no hay nada que reintentar en un 200.
    retry: false,
  });

  return {
    imageUrl: query.data ?? null,
    // Sin key no hay nada que cargar: `isPending` de una query deshabilitada
    // queda en true para siempre y dejaría un Skeleton perpetuo.
    isLoading: Boolean(objectKey) && query.isPending,
    isUnavailable: query.isError,
  };
}

/**
 * Los dos pasos: resuelve la key con `GET /user/{userId}` y después la firma.
 * Para quien solo tiene el id (el Navbar y la pantalla de perfil, que arrancan
 * de `useSession()` y por eso no tienen la key).
 *
 * Un fallo al resolver la foto **no** es un error de pantalla: se cae al avatar
 * de iniciales, igual que un usuario sin foto.
 */
export function useProfileImage(userId: string | null | undefined): {
  imageUrl: string | null;
  isLoading: boolean;
  isUnavailable: boolean;
  /** Sabemos que hay una imagen guardada, aunque no podamos mostrarla. */
  hasImage: boolean;
  /**
   * No pudimos averiguar si tiene imagen: falló `GET /user/{userId}`, así que
   * ni siquiera llegamos a la key. Es distinto de `hasImage: false` ("sabemos
   * que no tiene") y quien ofrezca la acción de quitarla tiene que tratarlo
   * como un "puede que sí" — esconderla dejaría sin salida a quien sí tiene
   * una foto subida.
   */
  isIndeterminate: boolean;
} {
  const userQuery = useQuery({
    queryKey: userQueryKey(userId ?? ""),
    queryFn: ({ signal }) => apiClient.get<User>(`/user/${userId}`, { signal }),
    enabled: Boolean(userId),
  });

  const objectKey = userQuery.data?.profileImage;

  const {
    imageUrl,
    isLoading: isUrlLoading,
    isUnavailable,
  } = useSignedProfileImageUrl(objectKey);

  return {
    imageUrl,
    isLoading: (Boolean(userId) && userQuery.isPending) || isUrlLoading,
    isUnavailable,
    hasImage: Boolean(objectKey),
    isIndeterminate: userQuery.isError,
  };
}
