// la pagina solo llama a la vista, todo lo demas esta en features/moderacion.
// va en /postulantes y no /postulaciones porque esa ruta ya la usa el alumno.

import { PostulacionesView } from "@/features/moderacion/components/postulaciones/postulaciones-view";

export default function PostulantesPage() {
  return <PostulacionesView />;
}
