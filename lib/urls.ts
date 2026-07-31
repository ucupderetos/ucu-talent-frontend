/**
 * URL de perfil (sitio web, LinkedIn) lista para un `href`.
 *
 * Los usuarios escriben tanto `https://linkedin.com/in/x` como `linkedin.com/in/x`;
 * sin esquema, el navegador trata el segundo como ruta relativa y navega dentro
 * de la app. Le anteponemos `https://` cuando falta.
 *
 * Efecto lateral buscado: cualquier otro esquema (`javascript:`, `data:`) tampoco
 * matchea, así que también termina prefijado y queda inerte como URL absoluta
 * rota en vez de ejecutarse. No reemplaza a validar el campo en el form —
 * ver `z.url()` en los schemas de perfil.
 */
export function toExternalHref(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

/**
 * ¿`value` sirve como URL de perfil? Valida el valor YA normalizado por
 * `toExternalHref`, para no rechazar lo que el propio helper acepta:
 * `linkedin.com/in/x` es válido, igual que `https://linkedin.com/in/x`.
 *
 * No alcanza con `z.url()` a secas por dos motivos:
 *  - rechaza las URLs sin esquema, que son la mitad de lo que la gente escribe;
 *  - acepta CUALQUIER esquema, incluido `javascript:`.
 *
 * El `hostname.includes(".")` es lo que separa un dominio de un texto suelto:
 * `https://mi-perfil` parsea bien como URL (host de una sola etiqueta) pero no
 * resuelve a ningún lado, y es exactamente el caso que queremos frenar.
 */
export function isExternalUrl(value: string): boolean {
  let url: URL;
  try {
    url = new URL(toExternalHref(value));
  } catch {
    return false;
  }
  return (url.protocol === "https:" || url.protocol === "http:") && url.hostname.includes(".");
}
