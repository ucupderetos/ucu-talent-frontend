// Helpers de avatar compartidos por las tablas de personas (postulantes,
// alumnos, empresas). Antes estaban duplicados en cada tabla, con dos nombres
// distintos para la constante de colores.
//
// El color sale de un hash del id — estable sin importar en qué página caiga la
// fila (no rota por índice). Tokens semánticos `--chart-*` de globals.css, no
// la paleta cruda de Tailwind.

const AVATAR_COLOR_CLASSES = [
  "bg-chart-1/15 text-chart-1",
  "bg-chart-2/15 text-chart-2",
  "bg-chart-3/15 text-chart-3",
  "bg-chart-4/15 text-chart-4",
  "bg-chart-5/15 text-chart-5",
];

/** Clase de color estable para el avatar de una entidad, derivada de su id. */
export function avatarColorFor(id: string): string {
  let hash = 0;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) % AVATAR_COLOR_CLASSES.length;
  return AVATAR_COLOR_CLASSES[hash];
}

/** Iniciales a partir de dos partes (nombre + apellido, o razón social). */
export function initialsFrom(first: string, second = ""): string {
  const a = first.trim()[0] ?? "";
  const b = second.trim()[0] ?? "";
  return `${a}${b}`.toUpperCase();
}
