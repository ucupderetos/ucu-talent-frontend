// Ruta: /puestos/[id]/postulantes — postulantes de un puesto (vista empresa).
// Placeholder inicial. Owner: (asignar).
// Nota Next 16: `params` es una Promise, hay que await-earla.
export default async function PostulantesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <h1>Postulantes del puesto {id}</h1>;
}
