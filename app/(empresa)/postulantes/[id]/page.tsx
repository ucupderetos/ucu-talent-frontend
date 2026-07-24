// Ruta: /postulantes/[id] — detalle de un postulante puntual (el "CV" que ve
// la empresa). Delgada a propósito: toda la lógica vive en
// features/postulaciones/.
//
// Nota Next 16: `params` es una Promise, hay que await-earla.

import { ApplicantDetailView } from "@/features/postulaciones/components/applicant-detail-view";

export default async function PostulanteDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ApplicantDetailView vacancyApplicationId={id} />;
}
