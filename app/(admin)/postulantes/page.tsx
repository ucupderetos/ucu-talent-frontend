// la pagina solo llama a la vista, todo lo demas esta en features/moderacion.
// va en /postulantes y no /postulaciones porque esa ruta ya la usa el alumno.

import { ApplicationsView } from "@/features/moderacion/components/applications/applications-view";

export default function PostulantesPage() {
  return <ApplicationsView />;
}
