// Layout del wizard de creación de oferta. Envuelve los 3 pasos
// (informacion-basica, detalles-del-puesto, revision) con el form
// compartido, para que sobreviva a la navegación entre ellos.
//
// TODO: RN-02 exige que la empresa tenga status = APROBADA para publicar
// puestos. Ese chequeo depende de datos reales de Company que hoy no están
// conectados al back — el layout padre (empresa) ya valida el ROL, pero no
// el estado de aprobación. Agregar acá cuando el back esté listo.

import { CreateJobFormProvider } from "@/features/puestos/hooks/use-create-job-form";

export default function CrearOfertaLayout({ children }: { children: React.ReactNode }) {
  return <CreateJobFormProvider>{children}</CreateJobFormProvider>;
}
