// datos de prueba de los alumnos mientras no tengamos el back.
// despues esto se borra y los datos vienen del endpoint.

export interface UsuarioRow {
  id: string;
  name: string;
  surname: string;
  documentNumber: string;
  degree: string; // carrera
  area: string; // facultad
  email: string;
  registeredAt: string; // ISO 8601
}

export const USUARIOS_MOCK: UsuarioRow[] = [
  {
    id: "u-10",
    name: "María",
    surname: "Fernández",
    documentNumber: "4.123.456-7",
    degree: "Ingeniería en Sistemas",
    area: "Ingeniería",
    email: "maria.fernandez@ucu.edu.uy",
    registeredAt: "2026-07-14T10:00:00.000Z",
  },
  {
    id: "u-11",
    name: "Juan",
    surname: "Pérez",
    documentNumber: "4.987.654-3",
    degree: "Administración de Empresas",
    area: "Ciencias Empresariales",
    email: "juan.perez@ucu.edu.uy",
    registeredAt: "2026-07-12T10:00:00.000Z",
  },
  {
    id: "u-12",
    name: "Sofía",
    surname: "González",
    documentNumber: "5.112.233-4",
    degree: "Comunicación",
    area: "Comunicación",
    email: "sofia.gonzalez@ucu.edu.uy",
    registeredAt: "2026-07-10T10:00:00.000Z",
  },
  {
    id: "u-13",
    name: "Agustín",
    surname: "Rodríguez",
    documentNumber: "4.556.667-8",
    degree: "Ingeniería Industrial",
    area: "Ingeniería",
    email: "agustin.rodriguez@ucu.edu.uy",
    registeredAt: "2026-07-08T10:00:00.000Z",
  },
  {
    id: "u-14",
    name: "Valentina",
    surname: "Silveira",
    documentNumber: "5.334.455-6",
    degree: "Contador Público",
    area: "Ciencias Empresariales",
    email: "valentina.silveira@ucu.edu.uy",
    registeredAt: "2026-07-07T10:00:00.000Z",
  },
  {
    id: "u-15",
    name: "Mateo",
    surname: "Cabrera",
    documentNumber: "4.221.334-5",
    degree: "Derecho",
    area: "Derecho",
    email: "mateo.cabrera@ucu.edu.uy",
    registeredAt: "2026-07-05T10:00:00.000Z",
  },
  {
    id: "u-16",
    name: "Lucía",
    surname: "Martínez",
    documentNumber: "5.667.889-0",
    degree: "Psicología",
    area: "Psicología",
    email: "lucia.martinez@ucu.edu.uy",
    registeredAt: "2026-07-03T10:00:00.000Z",
  },
  {
    id: "u-17",
    name: "Rodrigo",
    surname: "Núñez",
    documentNumber: "4.778.899-1",
    degree: "Marketing",
    area: "Comunicación",
    email: "rodrigo.nunez@ucu.edu.uy",
    registeredAt: "2026-07-01T10:00:00.000Z",
  },
];
