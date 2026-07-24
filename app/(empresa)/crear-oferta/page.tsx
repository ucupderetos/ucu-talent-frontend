import { redirect } from "next/navigation";

// El item de nav "Crear oferta" apunta a /crear-oferta (no al paso 1 directo)
// para que el header dinámico matchee la MISMA sección en los 3 pasos del
// wizard. Esta ruta no tiene UI propia: redirige al primer paso real.
export default function CrearOfertaPage() {
  redirect("/crear-oferta/informacion-basica");
}
