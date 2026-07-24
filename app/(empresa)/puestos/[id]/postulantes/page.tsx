// Ruta: /puestos/[id]/postulantes — postulantes de un puesto (vista empresa).
// Placeholder inicial. Owner: (asignar).
// Nota Next 16: `params` es una Promise, hay que await-earla.
import { PostulantesPlaceholder } from "@/features/postulaciones/components/postulantes-placeholder";

export default async function PostulantesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PostulantesPlaceholder vacancyId={id} />;
}
