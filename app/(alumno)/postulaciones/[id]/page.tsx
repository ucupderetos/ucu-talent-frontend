// Ruta: /postulaciones/[id] — detalle de la vacante de una postulación
// (vista alumno), entrando desde "Mis postulaciones" en vez de "Vacantes".
// Misma vista que /feed/[id]: VacancyDetailView ya resuelve "Volver" y el
// breadcrumb del Navbar según el pathname. Página delgada: toda la lógica
// vive en features/puestos/.
// Nota Next 16: `params` es una Promise, hay que await-earla.

import { VacancyDetailView } from "@/features/puestos/components/vacancy-detail-view";

export default async function ApplicationVacancyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <VacancyDetailView vacancyId={id} />;
}
