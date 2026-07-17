// Datos mock compartidos para desarrollar mientras el backend no exista.
//
// Existen para que los 3 grupos no inventen cada uno sus propios datos falsos:
// si todos maquetan contra los mismos objetos, las pantallas encajan cuando se
// integren. Cuando la API esté lista, esto se borra.
//
// ⚠️ Usarlo solo mientras se maquetan pantallas, con la intención de sacarlo.
// La única excepción es lib/auth.ts, que lo consume detrás del flag
// NEXT_PUBLIC_MOCK_SESSION para poder simular el usuario logueado.

import type {
  Empresa,
  PerfilAlumno,
  Postulacion,
  Puesto,
  User,
} from "@/types";

export const USUARIOS_MOCK: Record<"alumno" | "empresa" | "admin", User> = {
  alumno: {
    id: "u-1",
    nombre: "Lucía Fernández",
    email: "lucia.fernandez@correo.ucu.edu.uy",
    rol: "alumno",
  },
  empresa: {
    id: "u-2",
    nombre: "Martín Rodríguez",
    email: "martin@datalab.com.uy",
    rol: "empresa",
  },
  admin: {
    id: "u-3",
    nombre: "Admin UCU",
    email: "talento@ucu.edu.uy",
    rol: "admin",
  },
};

export const EMPRESAS_MOCK: Empresa[] = [
  { id: "e-1", nombre: "DataLab", estado: "aprobada" },
  // Para probar el gate de RF-13: esta todavía no puede operar.
  { id: "e-2", nombre: "Startup Sin Aprobar", estado: "pendiente" },
];

export const PUESTOS_MOCK: Puesto[] = [
  {
    id: "p-1",
    titulo: "Desarrollador/a Frontend Jr",
    descripcion: "React y TypeScript. Pasantía de 20 hs semanales, modalidad híbrida.",
    estado: "publicado",
    empresaId: "e-1",
    empresaNombre: "DataLab",
    publicadoEn: "2026-07-10T14:00:00.000Z",
  },
  {
    id: "p-2",
    titulo: "Analista de Datos",
    descripcion: "SQL y Python. Para estudiantes avanzados de Ingeniería o afines.",
    estado: "pausado",
    empresaId: "e-1",
    empresaNombre: "DataLab",
    publicadoEn: "2026-06-28T09:30:00.000Z",
  },
];

export const ALUMNOS_MOCK: PerfilAlumno[] = [
  {
    id: "u-1",
    nombre: "Lucía Fernández",
    email: "lucia.fernandez@correo.ucu.edu.uy",
    carrera: "Ingeniería en Informática",
    skills: ["React", "TypeScript", "SQL"],
  },
  {
    id: "u-4",
    nombre: "Diego Pereira",
    email: "diego.pereira@correo.ucu.edu.uy",
    carrera: "Analista en Sistemas",
    skills: ["Python", "SQL"],
  },
];

/** Una postulación por cada estado, para poder maquetar los 3 casos. */
export const POSTULACIONES_MOCK: Postulacion[] = [
  {
    id: "po-1",
    puestoId: "p-1",
    alumnoId: "u-1",
    estado: "pendiente",
    postuladoEn: "2026-07-12T11:00:00.000Z",
  },
  {
    id: "po-2",
    puestoId: "p-1",
    alumnoId: "u-4",
    estado: "visto",
    postuladoEn: "2026-07-11T16:45:00.000Z",
  },
  {
    id: "po-3",
    puestoId: "p-2",
    alumnoId: "u-1",
    estado: "finalizado",
    postuladoEn: "2026-07-01T08:15:00.000Z",
  },
];
