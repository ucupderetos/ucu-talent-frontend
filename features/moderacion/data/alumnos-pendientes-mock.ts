// datos de prueba de los alumnos pendientes de aprobacion (cedula no
// encontrada en el padron) mientras no tengamos el back. despues esto se
// borra y los datos vienen del endpoint.

export interface AlumnoPendienteRow {
  id: string;
  name: string;
  surname: string;
  documentType: string;
  documentNumber: string;
  email: string;
  solicitadaAt: string; // ISO 8601
  hace: string; // texto tipo "Hace 2 horas"
}

export const ALUMNOS_PENDIENTES_MOCK: AlumnoPendienteRow[] = [
  {
    id: "ap-1",
    name: "Camila",
    surname: "Suárez",
    documentType: "Cédula",
    documentNumber: "4.998.112-3",
    email: "camila.suarez@gmail.com",
    solicitadaAt: "2026-07-14T09:00:00.000Z",
    hace: "Hace 3 horas",
  },
  {
    id: "ap-2",
    name: "Nicolás",
    surname: "Ferreira",
    documentType: "Cédula",
    documentNumber: "4.556.221-9",
    email: "nico.ferreira@hotmail.com",
    solicitadaAt: "2026-07-13T09:00:00.000Z",
    hace: "Hace 1 día",
  },
  {
    id: "ap-3",
    name: "Brenda",
    surname: "López",
    documentType: "Cédula",
    documentNumber: "5.223.887-1",
    email: "brenda.lopez@gmail.com",
    solicitadaAt: "2026-07-11T09:00:00.000Z",
    hace: "Hace 3 días",
  },
];
