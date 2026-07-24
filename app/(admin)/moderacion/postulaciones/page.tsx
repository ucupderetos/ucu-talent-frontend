// la pagina solo llama a la vista, todo lo demas esta en features/moderacion.
// va en /moderacion/postulaciones: el prefijo la separa de /postulaciones (que
// ya usa el alumno) y de /postulantes (que ya usa la empresa).

import { ApplicationsView } from "@/features/moderacion/components/applications/applications-view";

export default function PostulacionesPage() {
  return <ApplicationsView />;
}
