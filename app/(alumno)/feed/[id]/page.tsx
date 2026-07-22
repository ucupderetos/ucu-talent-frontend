// Ruta: /feed/[id] — detalle de una vacante (vista alumno). RF-PUE / RF-14.
// Página delgada: toda la lógica vive en features/puestos/.
// Nota Next 16: `params` es una Promise, hay que await-earla.

import { VacancyDetailView } from "@/features/puestos/components/vacancy-detail-view";

export default async function VacancyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <VacancyDetailView vacancyId={id} />;
}
