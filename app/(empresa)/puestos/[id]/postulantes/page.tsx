// Ruta: /puestos/[id]/postulantes — alias de compatibilidad.
//
// La pantalla real de postulantes es cruzada a todas las ofertas (/postulantes,
// ver features/postulaciones/), con selector de oferta — no una vista por
// vacante. Esta ruta anidada se mantiene solo para no romper enlaces viejos
// ("Ver postulantes" desde una oferta puntual): redirige pre-filtrada.
// Nota Next 16: `params` es una Promise, hay que await-earla.
import { redirect } from "next/navigation";

export default async function PostulantesDeOfertaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/postulantes?vacancyId=${id}`);
}
