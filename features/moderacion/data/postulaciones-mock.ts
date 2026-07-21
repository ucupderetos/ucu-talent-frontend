// datos de prueba de las postulaciones mientras no tengamos el back.
// despues esto se borra y los datos vienen del endpoint.

export type EstadoPostulacion =
  | "En evaluación"
  | "Entrevista"
  | "Preseleccionado"
  | "En revisión"
  | "No seleccionado"
  | "Retirado";

export interface PostulacionRow {
  id: string;
  name: string;
  surname: string;
  email: string;
  oferta: string;
  ofertaId: string; // ej. #OF-00086
  empresa: string;
  appliedAt: string; // ISO 8601
  hace: string; // texto relativo, ej. "Hace 2 horas"
  estado: EstadoPostulacion;
}

export const POSTULACIONES_MOCK: PostulacionRow[] = [
  {
    id: "p-1",
    name: "María",
    surname: "Fernández",
    email: "maria.fernandez@ucu.edu.uy",
    oferta: "Pasante de Marketing",
    ofertaId: "#OF-00086",
    empresa: "Tech Solutions S.A.",
    appliedAt: "2026-07-14T10:00:00.000Z",
    hace: "Hace 2 horas",
    estado: "En evaluación",
  },
  {
    id: "p-2",
    name: "Juan",
    surname: "Pérez",
    email: "juan.perez@ucu.edu.uy",
    oferta: "Ejecutivo de Cuentas",
    ofertaId: "#OF-00085",
    empresa: "Green Energy Uruguay",
    appliedAt: "2026-07-13T10:00:00.000Z",
    hace: "Hace 1 día",
    estado: "Entrevista",
  },
  {
    id: "p-3",
    name: "Sofía",
    surname: "González",
    email: "sofia.gonzalez@ucu.edu.uy",
    oferta: "Diseñador/a Gráfico",
    ofertaId: "#OF-00083",
    empresa: "Distribuidora del Sur",
    appliedAt: "2026-07-10T10:00:00.000Z",
    hace: "Hace 3 días",
    estado: "Preseleccionado",
  },
  {
    id: "p-4",
    name: "Agustín",
    surname: "Rodríguez",
    email: "agustin.rodriguez@ucu.edu.uy",
    oferta: "Desarrollador Frontend",
    ofertaId: "#OF-00084",
    empresa: "Constructora Horizonte",
    appliedAt: "2026-07-08T10:00:00.000Z",
    hace: "Hace 5 días",
    estado: "En revisión",
  },
  {
    id: "p-5",
    name: "Valentina",
    surname: "Silveira",
    email: "valentina.silveira@ucu.edu.uy",
    oferta: "Community Manager",
    ofertaId: "#OF-00082",
    empresa: "Salud & Bienestar",
    appliedAt: "2026-07-07T10:00:00.000Z",
    hace: "Hace 6 días",
    estado: "No seleccionado",
  },
  {
    id: "p-6",
    name: "Mateo",
    surname: "Cabrera",
    email: "mateo.cabrera@ucu.edu.uy",
    oferta: "Ejecutivo de Cuentas",
    ofertaId: "#OF-00085",
    empresa: "Green Energy Uruguay",
    appliedAt: "2026-07-06T10:00:00.000Z",
    hace: "Hace 7 días",
    estado: "Retirado",
  },
  {
    id: "p-7",
    name: "Lucía",
    surname: "Martínez",
    email: "lucia.martinez@ucu.edu.uy",
    oferta: "Pasante de Marketing",
    ofertaId: "#OF-00086",
    empresa: "Tech Solutions S.A.",
    appliedAt: "2026-07-05T10:00:00.000Z",
    hace: "Hace 8 días",
    estado: "En evaluación",
  },
  {
    id: "p-8",
    name: "Rodrigo",
    surname: "Núñez",
    email: "rodrigo.nunez@ucu.edu.uy",
    oferta: "Desarrollador Frontend",
    ofertaId: "#OF-00084",
    empresa: "Constructora Horizonte",
    appliedAt: "2026-07-04T10:00:00.000Z",
    hace: "Hace 9 días",
    estado: "Entrevista",
  },
];
