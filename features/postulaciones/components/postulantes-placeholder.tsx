"use client";

// Placeholder de /puestos/[id]/postulantes (vista empresa). Existe sobre todo
// para que la página tenga dónde llamar a `usePageBreadcrumb` — cuando se
// reemplace por la vista real, el nombre de la vacante sale de su propio
// fetch, no del id de la URL.

import { usePageBreadcrumb } from "@/components/layout/breadcrumb-context";

export function PostulantesPlaceholder({ vacancyId }: { vacancyId: string }) {
  usePageBreadcrumb(`Puesto ${vacancyId}`);

  return <h1>Postulantes del puesto {vacancyId}</h1>;
}
