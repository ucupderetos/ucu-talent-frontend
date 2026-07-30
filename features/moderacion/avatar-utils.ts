// Estaba duplicado en 4 tablas (students, pending-companies, pending-students,
// applications), cada una con su propia copia ligeramente distinta. El color
// sale de un hash del id, así no cambia según la página en la que caiga la
// fila; los tokens son semánticos (`--chart-*` de globals.css), no la paleta
// cruda de Tailwind.

const COLOR_CLASSES = [
  "bg-chart-1/15 text-chart-1",
  "bg-chart-2/15 text-chart-2",
  "bg-chart-3/15 text-chart-3",
  "bg-chart-4/15 text-chart-4",
  "bg-chart-5/15 text-chart-5",
];

export function avatarColorFor(id: string): string {
  let hash = 0;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) % COLOR_CLASSES.length;
  return COLOR_CLASSES[hash];
}

/** `?? ""` porque con datos reales un nombre o apellido puede venir vacío, y
 *  `name[0]` sería `undefined` — el avatar diría "undefinedU". */
export function personInitials(name: string, surname: string): string {
  return `${name[0] ?? ""}${surname[0] ?? ""}`.toUpperCase();
}

/** Fallback a la primera letra: una razón social sin ninguna palabra en
 *  mayúscula ("datalab") dejaría el cuadrito de color vacío. */
export function companyInitials(name: string): string {
  const fromCapitals = name
    .split(" ")
    .filter((word) => /^[A-ZÁÉÍÓÚ]/.test(word))
    .slice(0, 2)
    .map((word) => word[0])
    .join("");

  return (fromCapitals || name.trim()[0] || "").toUpperCase();
}
