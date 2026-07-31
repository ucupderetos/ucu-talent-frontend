// Cliente HTTP centralizado hacia la API de Spring Boot.
// Todo el fetching de la app pasa por acá — nunca `fetch()` suelto en un componente.
//
// Este archivo define la FORMA del cliente (verbos, errores, base URL), no los
// endpoints — esos están en docs/ENDPOINTS.md (contrato funcional cerrado). Los
// hooks de cada dominio viven en features/<x>/hooks/ y usan estos helpers con
// TanStack Query (ver `docs/agents/data-fetching.md`) — no useEffect + useState.

/**
 * Base URL de la API. Se lee en build time — tiene que existir en .env.local.
 * Ver .env.example.
 */
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

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
  get isUnauthenticated(): boolean {
    return this.status === 401;
  }

  /** Autenticado pero sin permiso para esto (rol equivocado, empresa no aprobada). */
  get isForbidden(): boolean {
    return this.status === 403;
  }

  /**
   * Mapa de errores por campo (`{ errores: { campo: mensaje } }`, A-19 en
   * `docs/agents/open-questions.md` — `application/problem+json`). `undefined` si el backend no
   * mandó ese shape (errores no ligados a un form, red caída, etc.). Pensado
   * para mapear directo a `setError` de RHF en los formularios.
   */
  get fieldErrors(): Record<string, string> | undefined {
    if (!this.body || typeof this.body !== "object") return undefined;
    const { errores } = this.body as { errores?: unknown };
    if (!errores || typeof errores !== "object") return undefined;
    return errores as Record<string, string>;
  }
}

interface RequestOptions {
  /** Query params. Los `undefined` se descartan. */
  params?: Record<string, string | number | boolean | undefined>;
  signal?: AbortSignal;
}

function buildUrl(path: string, params?: RequestOptions["params"]): string {
  if (!BASE_URL) {
    throw new ApiError(
      0,
      "Falta NEXT_PUBLIC_API_BASE_URL. Copiá .env.example a .env.local y completalo.",
    );
  }

  const url = new URL(
    path.startsWith("/") ? path.slice(1) : path,
    BASE_URL.endsWith("/") ? BASE_URL : `${BASE_URL}/`,
  );

  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  return url.toString();
}

async function request<T>(
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  path: string,
  body?: unknown,
  options: RequestOptions = {},
): Promise<T> {
  const url = buildUrl(path, options.params);

  // Subida de archivos (foto de perfil, CV): el body va como FormData y el
  // `Content-Type` lo pone el browser, porque tiene que incluir el `boundary`
  // del multipart. Setearlo a mano acá rompe la request.
  const isMultipart = body instanceof FormData;

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      // La sesión viaja en cookie httpOnly, así que el browser tiene que mandarla
      // en cross-origin. Si el backend termina usando un token en header, se
      // cambia acá y en ningún otro lado.
      credentials: "include",
      headers:
        body === undefined || isMultipart ? undefined : { "Content-Type": "application/json" },
      body: body === undefined || isMultipart ? (body as FormData | undefined) : JSON.stringify(body),
      signal: options.signal,
    });
  } catch (cause) {
    // Nunca llegamos al servidor: red caída, CORS, o abort.
    if (cause instanceof DOMException && cause.name === "AbortError") throw cause;
    throw new ApiError(0, "No se pudo conectar con el servidor.", cause);
  }

  if (response.status === 204) return undefined as T;

  const rawText = await response.text();
  const payload = safeJsonParse(rawText);

  if (!response.ok) {
    throw new ApiError(response.status, errorMessage(payload, response), payload);
  }

  return payload as T;
}

function safeJsonParse(text: string): unknown {
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    // El backend mandó algo que no es JSON. Puede ser un error (un stack trace
    // de Spring en HTML) o una respuesta legítima de texto plano: los endpoints
    // de archivos devuelven la URL firmada como `ResponseEntity<String>` cruda,
    // no como JSON. En los dos casos se devuelve el texto tal cual, así un
    // `apiClient.get<string>()` recibe la URL sin necesitar un caso especial.
    return text;
  }
}

function errorMessage(payload: unknown, response: Response): string {
  // Wire confirmado (`docs/agents/open-questions.md`, A-19): `application/problem+json` con
  // { detail, title, status, instance, errores: { campo: mensaje } }. Se
  // priorizan los mensajes de campo (más específicos) sobre `detail`/`title`
  // genéricos, y se dejan `message`/`error` como fallback por si algún
  // endpoint todavía no migró a problem+json.
  if (payload && typeof payload === "object") {
    const candidate = payload as {
      detail?: unknown;
      title?: unknown;
      message?: unknown;
      error?: unknown;
      errores?: unknown;
    };

    if (candidate.errores && typeof candidate.errores === "object") {
      const fieldMessages = Object.values(candidate.errores as Record<string, unknown>).filter(
        (msg): msg is string => typeof msg === "string",
      );
      if (fieldMessages.length > 0) return fieldMessages.join(" · ");
    }

    if (typeof candidate.detail === "string") return candidate.detail;
    if (typeof candidate.title === "string") return candidate.title;
    if (typeof candidate.message === "string") return candidate.message;
    if (typeof candidate.error === "string") return candidate.error;
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
