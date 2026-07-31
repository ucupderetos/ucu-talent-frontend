// Recorrido completo de `GET /user`, que las pantallas de moderación necesitan
// entero (filtran y paginan en memoria, no del lado del servidor).
//
// ⚠️ `GET /user` PAGINA del lado del servidor y ninguna versión de
// `ENDPOINTS.md` lo documenta — la del backend incluso lo describe mal, como
// lista plana con solo `status`/`role`. Verificado contra el código fuente
// (`user/UserController.getAll`, rama `dev`), cuya firma real es:
//
//   getAll(AccountStatus status, Role role, int page = 0, int size = 20)
//
// O sea que pedirlo sin `page`/`size` devuelve **solo los primeros 20
// usuarios**, en silencio y sin metadata que lo delate. Ver A-29 en
// `docs/agents/open-questions.md`.
//
// No es un hook (no usa React): vive en la raíz del dominio, como `date-utils`.

import { apiClient } from "@/lib/api-client";
import type { AccountStatus, Role, User } from "@/types";

const USER_PAGE_SIZE = 100;

/**
 * Agota las páginas de `GET /user` y devuelve todos los usuarios que matcheen
 * los filtros.
 *
 * ⚠️ Deduplica por `userId` a propósito: el endpoint **no acepta `sort`**, así
 * que el orden entre páginas no está garantizado y una fila puede aparecer en
 * dos páginas ante altas concurrentes. Sin deduplicar, ese usuario se cuenta
 * dos veces — infla el `total` que alimenta la paginación de la tabla y repite
 * la key de React. El backend debería agregar un orden estable; mientras tanto
 * esto lo contiene.
 */
export async function fetchAllUsers(
  filters: { role?: Role; status?: AccountStatus },
  signal?: AbortSignal,
): Promise<User[]> {
  const usersById = new Map<string, User>();

  for (let page = 0; ; page += 1) {
    const batch = await apiClient.get<User[]>("/user", {
      params: { ...filters, page, size: USER_PAGE_SIZE },
      signal,
    });

    for (const user of batch) usersById.set(user.userId, user);

    // Una página incompleta es la última: no hay total en la respuesta.
    if (batch.length < USER_PAGE_SIZE) return [...usersById.values()];
  }
}
