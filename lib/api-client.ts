// Cliente HTTP centralizado hacia la API de Spring Boot.
// Todo el fetching de la app pasa por acá — nunca `fetch()` suelto en un componente.
//
// ⚠️ El contrato de la API todavía no está definido. Este archivo define la FORMA
// del cliente (verbos, errores, base URL), no los endpoints. Los hooks de cada
// dominio viven en features/<x>/hooks/ y usan estos helpers.
//
// Es agnóstico de la capa de cache: sirve tal cual con TanStack Query o con
// useEffect + useState (decisión pendiente del equipo).

/**
 * Base URL de la API. Se lee en build time — tiene que existir en .env.local.
 * Ver .env.example.
 */
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Error normalizado de la API. Todo lo que falle sale como ApiError, así los
 * componentes no tienen que distinguir entre "se cayó la red" y "el back dijo 403".
 */
export class ApiError extends Error {
  constructor(
    /** HTTP status. 0 si la request nunca llegó (red caída, CORS, timeout). */
    readonly status: number,
    message: string,
    /** Cuerpo crudo de la respuesta, si el backend mandó algo parseable. */
    readonly body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }

  /** No autenticado: no hay cookie de sesión o venció. */
  get esNoAutenticado(): boolean {
    return this.status === 401;
  }

  /** Autenticado pero sin permiso para esto (rol equivocado, empresa no aprobada). */
  get esProhibido(): boolean {
    return this.status === 403;
  }
}

interface RequestOptions {
  /** Query params. Los `undefined` se descartan. */
  params?: Record<string, string | number | boolean | undefined>;
  signal?: AbortSignal;
}

function construirUrl(path: string, params?: RequestOptions["params"]): string {
  if (!BASE_URL) {
    throw new ApiError(
      0,
      "Falta NEXT_PUBLIC_API_URL. Copiá .env.example a .env.local y completalo.",
    );
  }

  const url = new URL(
    path.startsWith("/") ? path.slice(1) : path,
    BASE_URL.endsWith("/") ? BASE_URL : `${BASE_URL}/`,
  );

  for (const [clave, valor] of Object.entries(params ?? {})) {
    if (valor !== undefined) url.searchParams.set(clave, String(valor));
  }

  return url.toString();
}

async function request<T>(
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  path: string,
  body?: unknown,
  options: RequestOptions = {},
): Promise<T> {
  const url = construirUrl(path, options.params);

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      // La sesión viaja en cookie httpOnly, así que el browser tiene que mandarla
      // en cross-origin. Si el backend termina usando un token en header, se
      // cambia acá y en ningún otro lado.
      credentials: "include",
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: options.signal,
    });
  } catch (causa) {
    // Nunca llegamos al servidor: red caída, CORS, o abort.
    if (causa instanceof DOMException && causa.name === "AbortError") throw causa;
    throw new ApiError(0, "No se pudo conectar con el servidor.", causa);
  }

  if (response.status === 204) return undefined as T;

  const textoCrudo = await response.text();
  const payload = parsearJsonSeguro(textoCrudo);

  if (!response.ok) {
    throw new ApiError(response.status, mensajeDeError(payload, response), payload);
  }

  return payload as T;
}

function parsearJsonSeguro(texto: string): unknown {
  if (!texto) return undefined;
  try {
    return JSON.parse(texto);
  } catch {
    // El backend mandó algo que no es JSON (ej. un stack trace de Spring en HTML).
    return texto;
  }
}

function mensajeDeError(payload: unknown, response: Response): string {
  // ⚠️ Spring Boot suele mandar { message } o { error }, pero la forma real del
  // error todavía no está confirmada. Ajustar cuando exista el contrato.
  if (payload && typeof payload === "object") {
    const posible = payload as { message?: unknown; error?: unknown };
    if (typeof posible.message === "string") return posible.message;
    if (typeof posible.error === "string") return posible.error;
  }
  return `${response.status} ${response.statusText}`;
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>("GET", path, undefined, options),

  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("POST", path, body, options),

  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("PUT", path, body, options),

  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("PATCH", path, body, options),

  del: <T>(path: string, options?: RequestOptions) =>
    request<T>("DELETE", path, undefined, options),
};
