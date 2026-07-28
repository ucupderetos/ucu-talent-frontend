// Ruta: /puestos/[id]/editar — editar una oferta ya publicada (vista empresa).
// Página delgada: toda la lógica vive en features/puestos/.
// Nota Next 16: `params` es una Promise, hay que await-earla.

import { EditVacancyView } from "@/features/puestos/components/edit-vacancy-view";

export default async function EditarOfertaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditVacancyView vacancyId={id} />;
}
