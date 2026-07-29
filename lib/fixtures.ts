// Datos mock compartidos para desarrollar mientras el backend no esté listo.
//
// Existen para que los 3 grupos no inventen cada uno sus propios datos falsos:
// si todos maquetan contra los mismos objetos, las pantallas encajan cuando se
// integren. Cuando la API esté lista, esto se borra.
//
// ⚠️ Usarlo solo mientras se maquetan pantallas, con la intención de sacarlo.
// La única excepción es lib/auth.ts, que lo consume detrás del flag
// NEXT_PUBLIC_MOCK_SESSION para poder simular el usuario logueado.

import type {
  Area,
  Company,
  Degree,
  Education,
  Role,
  StudentProfile,
  User,
  Vacancy,
  VacancyApplication,
  WorkExperience,
} from "@/types";

/**
 * Usuario de sesión mockeado por rol, YA con `name`/`surname` combinados
 * (lo que en la app real arma `getDisplayProfile` en lib/auth.ts a partir de
 * `/me` + el perfil del rol). Acá se simulan los dos en un solo objeto porque
 * no hay red de por medio.
 */
export const MOCK_USERS: Record<Role, User> = {
  ALUMNO: {
    userId: "u-1",
    email: "lucia.fernandez@correo.ucu.edu.uy",
    role: "ALUMNO",
    status: "APROBADO",
    registeredAt: "2026-03-01T10:00:00.000Z",
    name: "Lucía",
    surname: "Fernández",
  },
  EMPRESA: {
    userId: "u-2",
    email: "contacto@datalab.com.uy",
    role: "EMPRESA",
    status: "APROBADO",
    registeredAt: "2026-02-15T09:00:00.000Z",
    // Company no tiene apellido — el nombre acá es la razón social.
    name: "DataLab",
  },
  ADMIN: {
    userId: "u-3",
    email: "talento@ucu.edu.uy",
    role: "ADMIN",
    status: "APROBADO",
    registeredAt: "2026-01-10T08:00:00.000Z",
    name: "Admin",
    surname: "UCU",
  },
};

/**
 * Alumnos para el listado de "Usuarios" del admin (`(admin)/usuarios`). Va
 * como array — a diferencia de `MOCK_USERS`, que es un solo usuario por rol
 * para simular la sesión — porque acá la tabla necesita varios alumnos.
 *
 * PK compartida con `MOCK_STUDENT_PROFILES` (mismo `userId`/`studentProfileId`).
 */
export const MOCK_STUDENT_USERS: User[] = [
  {
    userId: "u-10",
    email: "maria.fernandez@correo.ucu.edu.uy",
    role: "ALUMNO",
    status: "APROBADO",
    registeredAt: "2026-07-14T10:00:00.000Z",
    name: "María",
    surname: "Fernández",
  },
  {
    userId: "u-11",
    email: "juan.perez@correo.ucu.edu.uy",
    role: "ALUMNO",
    status: "APROBADO",
    registeredAt: "2026-07-12T10:00:00.000Z",
    name: "Juan",
    surname: "Pérez",
  },
  {
    userId: "u-12",
    email: "sofia.gonzalez@correo.ucu.edu.uy",
    role: "ALUMNO",
    status: "APROBADO",
    registeredAt: "2026-07-10T10:00:00.000Z",
    name: "Sofía",
    surname: "González",
  },
  {
    userId: "u-13",
    email: "agustin.rodriguez@correo.ucu.edu.uy",
    role: "ALUMNO",
    status: "APROBADO",
    registeredAt: "2026-07-08T10:00:00.000Z",
    name: "Agustín",
    surname: "Rodríguez",
  },
  {
    userId: "u-14",
    email: "valentina.silveira@correo.ucu.edu.uy",
    role: "ALUMNO",
    status: "APROBADO",
    registeredAt: "2026-07-07T10:00:00.000Z",
    name: "Valentina",
    surname: "Silveira",
  },
];

/** Áreas jerárquicas: son el mecanismo del match del RF-14. */
export const MOCK_AREAS: Area[] = [
  { areaId: "a-1", name: "Tecnología", parentAreaId: null },
  { areaId: "a-2", name: "Desarrollo de Software", parentAreaId: "a-1" },
  { areaId: "a-3", name: "Datos", parentAreaId: "a-1" },
  { areaId: "a-4", name: "Marketing y Publicidad", parentAreaId: null },
  { areaId: "a-5", name: "Comercial", parentAreaId: null },
  { areaId: "a-6", name: "Diseño", parentAreaId: null },
];

export const MOCK_DEGREES: Degree[] = [
  { degreeId: "d-1", areaId: "a-2", name: "Ingeniería en Informática", isUcu: true },
  { degreeId: "d-2", areaId: "a-3", name: "Analista en Sistemas", isUcu: true },
  // Para tener variedad de carreras en el listado de alumnos del admin.
  { degreeId: "d-3", areaId: "a-5", name: "Administración de Empresas", isUcu: true },
  { degreeId: "d-4", areaId: "a-4", name: "Comunicación", isUcu: true },
];

/** `Company` ya no trae `approved` — la aprobación vive en `User.status`
 *  (ver MOCK_USERS.EMPRESA / el usuario `u-5` de la empresa sin aprobar).
 *
 *  PK compartida (ver AGENTS.md): `companyId` de DataLab tiene que ser el
 *  mismo valor que `MOCK_USERS.EMPRESA.userId` ("u-2") — si no,
 *  `useCurrentCompany()` nunca la encuentra y "Mis ofertas"/"Postulantes"
 *  quedan vacíos aunque haya datos cargados. */
export const MOCK_COMPANIES: Company[] = [
  {
    companyId: "u-2",
    name: "DataLab",
    industry: "Tecnología",
    description: "Consultora de datos y software.",
    webUrl: "https://datalab.com.uy",
    linkedinUrl: "https://linkedin.com/company/datalab",
    location: "MONTEVIDEO",
    status: "APROBADO",
    reviewedAt: "2026-02-16T09:00:00.000Z",
    adminComment: null,
  },
  {
    // Para probar el gate de RF-13: el `User` u-5 (no incluido en MOCK_USERS
    // porque no es una sesión logueable de prueba) está en `PENDIENTE`.
    companyId: "c-2",
    name: "Startup Nueva",
    industry: "Software",
    description: "Startup recién registrada.",
    webUrl: "https://startup.com.uy",
    linkedinUrl: "",
    location: "CANELONES",
    status: "PENDIENTE",
    reviewedAt: null,
    adminComment: null,
  },
  // empresas para la cola de validaciones del admin
  {
    companyId: "c-3",
    name: "Agro Sustentable S.A.",
    industry: "Agroindustria",
    description: "Producción agropecuaria sustentable.",
    webUrl: "https://agrosustentable.com.uy",
    linkedinUrl: "",
    location: "CANELONES",
    status: "PENDIENTE",
    reviewedAt: null,
    adminComment: null,
  },
  {
    companyId: "c-4",
    name: "Comercial del Este",
    industry: "Comercio",
    description: "Distribución mayorista.",
    webUrl: "https://comercialeste.com.uy",
    linkedinUrl: "",
    location: "MALDONADO",
    status: "PENDIENTE",
    reviewedAt: null,
    adminComment: null,
  },
];

// users de estas empresas, para poder mostrar el email y filtrar por status
// PENDIENTE en la pantalla de validaciones (Company no tiene status propio,
// vive en el User de la misma PK)
export const MOCK_COMPANY_USERS: User[] = [
  {
    userId: "c-2",
    email: "contacto@startupnueva.com.uy",
    role: "EMPRESA",
    status: "PENDIENTE",
    registeredAt: "2026-07-13T10:00:00.000Z",
    name: "Startup Nueva",
  },
  {
    userId: "c-3",
    email: "rrhh@agrosustentable.com.uy",
    role: "EMPRESA",
    status: "PENDIENTE",
    registeredAt: "2026-07-14T10:00:00.000Z",
    name: "Agro Sustentable S.A.",
  },
  {
    userId: "c-4",
    email: "talento@comercialeste.com.uy",
    role: "EMPRESA",
    status: "PENDIENTE",
    registeredAt: "2026-07-12T10:00:00.000Z",
    name: "Comercial del Este",
  },
];

export const MOCK_STUDENT_PROFILES: StudentProfile[] = [
  {
    studentProfileId: "u-1",
    name: "Lucía",
    surname: "Fernández",
    documentType: "CEDULA_IDENTIDAD",
    documentNumber: "51234567",
    phoneNumber: "099123456",
    linkedinUrl: "https://linkedin.com/in/lucia-fernandez",
    skills: ["React", "TypeScript", "SQL"],
    description: "Estudiante de Ingeniería en Informática, interesada en desarrollo frontend.",
    status: "APROBADO",
    reviewedAt: "2026-03-02T09:00:00.000Z",
    adminComment: null,
  },
  {
    studentProfileId: "sp-2",
    name: "Martina",
    surname: "Pereira",
    documentType: "CEDULA_IDENTIDAD",
    documentNumber: "49876543",
    phoneNumber: null,
    linkedinUrl: null,
    skills: ["Python", "SQL"],
    description: null,
    status: "APROBADO",
    reviewedAt: "2026-02-21T09:00:00.000Z",
    adminComment: null,
  },
  // perfiles de MOCK_STUDENT_USERS, para el listado de "Usuarios" del admin
  {
    studentProfileId: "u-10",
    name: "María",
    surname: "Fernández",
    documentType: "CEDULA_IDENTIDAD",
    documentNumber: "41234567",
    phoneNumber: "099000010",
    linkedinUrl: null,
    skills: ["React", "TypeScript"],
    description: null,
    status: "APROBADO",
    reviewedAt: "2026-07-15T10:00:00.000Z",
    adminComment: null,
  },
  {
    studentProfileId: "u-11",
    name: "Juan",
    surname: "Pérez",
    documentType: "CEDULA_IDENTIDAD",
    documentNumber: "48765432",
    phoneNumber: "099000011",
    linkedinUrl: null,
    skills: ["Excel", "Contabilidad"],
    description: null,
    status: "APROBADO",
    reviewedAt: "2026-07-13T10:00:00.000Z",
    adminComment: null,
  },
  {
    studentProfileId: "u-12",
    name: "Sofía",
    surname: "González",
    documentType: "CEDULA_IDENTIDAD",
    documentNumber: "51122334",
    phoneNumber: "099000012",
    linkedinUrl: null,
    skills: ["Redacción", "Redes sociales"],
    description: null,
    status: "APROBADO",
    reviewedAt: "2026-07-11T10:00:00.000Z",
    adminComment: null,
  },
  {
    studentProfileId: "u-13",
    name: "Agustín",
    surname: "Rodríguez",
    documentType: "DNI",
    documentNumber: "45566678",
    phoneNumber: "099000013",
    linkedinUrl: null,
    skills: ["Python", "SQL"],
    description: null,
    status: "APROBADO",
    reviewedAt: "2026-07-09T10:00:00.000Z",
    adminComment: null,
  },
  {
    studentProfileId: "u-14",
    name: "Valentina",
    surname: "Silveira",
    documentType: "PASAPORTE",
    documentNumber: "53344556",
    phoneNumber: "099000014",
    linkedinUrl: null,
    skills: ["Contabilidad"],
    description: null,
    status: "APROBADO",
    reviewedAt: "2026-07-08T10:00:00.000Z",
    adminComment: null,
  },
  // Perfiles de "otros alumnos" que existen para maquetar una lista de
  // postulantes con más de una persona (ver MOCK_APPLICANT_USERS abajo).
  {
    studentProfileId: "sp-3",
    name: "María",
    surname: "Fernández",
    documentType: "CEDULA_IDENTIDAD",
    documentNumber: "48765432",
    phoneNumber: "099123456",
    linkedinUrl: "https://linkedin.com/in/maria-fernandez",
    skills: ["Marketing Digital", "Redes Sociales", "Canva"],
    description: null,
    status: "APROBADO",
    reviewedAt: "2026-03-06T10:00:00.000Z",
    adminComment: null,
  },
  {
    studentProfileId: "sp-4",
    name: "Juan",
    surname: "Pérez",
    documentType: "CEDULA_IDENTIDAD",
    documentNumber: "47654321",
    phoneNumber: null,
    linkedinUrl: "https://linkedin.com/in/juan-perez",
    skills: ["Excel", "Atención al cliente"],
    description: null,
    status: "APROBADO",
    reviewedAt: "2026-03-11T10:00:00.000Z",
    adminComment: null,
  },
  {
    studentProfileId: "sp-5",
    name: "Sofía",
    surname: "González",
    documentType: "CEDULA_IDENTIDAD",
    documentNumber: "46543210",
    phoneNumber: "098765432",
    linkedinUrl: null,
    skills: ["Illustrator", "Photoshop", "Diseño gráfico"],
    description: null,
    status: "APROBADO",
    reviewedAt: "2026-03-13T10:00:00.000Z",
    adminComment: null,
  },
  {
    studentProfileId: "sp-6",
    name: "Agustín",
    surname: "Rodríguez",
    documentType: "CEDULA_IDENTIDAD",
    documentNumber: "45432109",
    phoneNumber: "097654321",
    linkedinUrl: "https://linkedin.com/in/agustin-rodriguez",
    skills: ["Comunicación", "SEO", "Redacción"],
    description: null,
    status: "APROBADO",
    reviewedAt: "2026-03-16T10:00:00.000Z",
    adminComment: null,
  },
  {
    studentProfileId: "sp-7",
    name: "Valentina",
    surname: "Silveira",
    documentType: "CEDULA_IDENTIDAD",
    documentNumber: "44321098",
    phoneNumber: null,
    linkedinUrl: null,
    skills: ["Community Management", "Canva"],
    // Todavía PENDIENTE (ver MOCK_APPLICANT_USERS): sirve para maquetar un
    // postulante sin aprobar en la vista de "Postulantes" de la empresa.
    description: null,
    status: "PENDIENTE",
    reviewedAt: null,
    adminComment: null,
  },
  {
    studentProfileId: "sp-8",
    name: "Mateo",
    surname: "Cabrera",
    documentType: "CEDULA_IDENTIDAD",
    documentNumber: "43210987",
    phoneNumber: "096543210",
    linkedinUrl: null,
    skills: ["Atención al cliente", "Ventas"],
    description: null,
    status: "APROBADO",
    reviewedAt: "2026-03-19T10:00:00.000Z",
    adminComment: null,
  },
  // alumnos para la cola de validaciones (cedula no encontrada en el padron)
  {
    studentProfileId: "sp-10",
    name: "Camila",
    surname: "Suárez",
    documentType: "CEDULA_IDENTIDAD",
    documentNumber: "49981123",
    phoneNumber: null,
    linkedinUrl: null,
    skills: [],
    description: null,
    status: "PENDIENTE",
    reviewedAt: null,
    adminComment: null,
  },
  {
    studentProfileId: "sp-11",
    name: "Nicolás",
    surname: "Ferreira",
    documentType: "CEDULA_IDENTIDAD",
    documentNumber: "45562219",
    phoneNumber: null,
    linkedinUrl: null,
    skills: [],
    description: null,
    status: "PENDIENTE",
    reviewedAt: null,
    adminComment: null,
  },
  {
    studentProfileId: "sp-12",
    name: "Brenda",
    surname: "López",
    documentType: "DNI",
    documentNumber: "52238871",
    phoneNumber: null,
    linkedinUrl: null,
    skills: [],
    description: null,
    status: "PENDIENTE",
    reviewedAt: null,
    adminComment: null,
  },
];

/**
 * `User` de cada postulante mock de `MOCK_STUDENT_PROFILES` usado en el
 * dominio `postulaciones` (PK compartida: `userId` = `studentProfileId`).
 * Nombre distinto de `MOCK_STUDENT_USERS` (arriba, para el listado de
 * "Usuarios" del admin) para no pisarlo — son dos conjuntos de alumnos mock
 * con propósitos distintos. Solo `MOCK_USERS.ALUMNO` (u-1) tiene una sesión
 * mock logueable — el resto son "otros alumnos" que existen para poder
 * maquetar una lista de postulantes con más de una persona.
 */
export const MOCK_APPLICANT_USERS: User[] = [
  MOCK_USERS.ALUMNO,
  {
    userId: "sp-2",
    email: "martina.pereira@correo.ucu.edu.uy",
    role: "ALUMNO",
    status: "APROBADO",
    registeredAt: "2026-02-20T10:00:00.000Z",
    name: "Martina",
    surname: "Pereira",
  },
  {
    userId: "sp-3",
    email: "maria.fernandez@gmail.com",
    role: "ALUMNO",
    status: "APROBADO",
    registeredAt: "2026-03-05T10:00:00.000Z",
    name: "María",
    surname: "Fernández",
  },
  {
    userId: "sp-4",
    email: "juanperez@gmail.com",
    role: "ALUMNO",
    status: "APROBADO",
    registeredAt: "2026-03-10T10:00:00.000Z",
    name: "Juan",
    surname: "Pérez",
  },
  {
    userId: "sp-5",
    email: "sofiagonzalez@gmail.com",
    role: "ALUMNO",
    status: "APROBADO",
    registeredAt: "2026-03-12T10:00:00.000Z",
    name: "Sofía",
    surname: "González",
  },
  {
    userId: "sp-6",
    email: "agustinrodriguez@gmail.com",
    role: "ALUMNO",
    status: "APROBADO",
    registeredAt: "2026-03-15T10:00:00.000Z",
    name: "Agustín",
    surname: "Rodríguez",
  },
  {
    userId: "sp-7",
    email: "valentina.silveira@gmail.com",
    role: "ALUMNO",
    status: "PENDIENTE",
    registeredAt: "2026-06-01T10:00:00.000Z",
    name: "Valentina",
    surname: "Silveira",
  },
  {
    userId: "sp-8",
    email: "mateocabrera@gmail.com",
    role: "ALUMNO",
    status: "APROBADO",
    registeredAt: "2026-03-18T10:00:00.000Z",
    name: "Mateo",
    surname: "Cabrera",
  },
];

// users de esos alumnos pendientes, mismo criterio que MOCK_COMPANY_USERS
export const MOCK_PENDING_STUDENT_USERS: User[] = [
  {
    userId: "sp-10",
    email: "camila.suarez@gmail.com",
    role: "ALUMNO",
    status: "PENDIENTE",
    registeredAt: "2026-07-14T09:00:00.000Z",
    name: "Camila",
    surname: "Suárez",
  },
  {
    userId: "sp-11",
    email: "nico.ferreira@hotmail.com",
    role: "ALUMNO",
    status: "PENDIENTE",
    registeredAt: "2026-07-13T09:00:00.000Z",
    name: "Nicolás",
    surname: "Ferreira",
  },
  {
    userId: "sp-12",
    email: "brenda.lopez@gmail.com",
    role: "ALUMNO",
    status: "PENDIENTE",
    registeredAt: "2026-07-11T09:00:00.000Z",
    name: "Brenda",
    surname: "López",
  },
];

export const MOCK_EDUCATION: Education[] = [
  {
    educationId: "e-1",
    studentProfileId: "u-1",
    degreeLevel: "LICENCIATURA",
    degreeId: "d-1",
    institution: null,
    description:
      "Cursando el 4º año de la carrera, con foco en desarrollo de software y bases de " +
      "datos. Participé en el equipo de programación competitiva de la facultad y cursé " +
      "como electivas Inteligencia Artificial y Diseño de Sistemas Distribuidos.",
    startDate: "2023-03-01T00:00:00.000Z",
    endDate: null,
  },
  {
    educationId: "e-2",
    studentProfileId: "u-1",
    degreeLevel: "TECNICATURA",
    degreeId: "d-2",
    institution: null,
    description:
      "Tecnicatura completa como primer paso antes de continuar con la Licenciatura en " +
      "Ingeniería en Informática. Trabajo final sobre optimización de consultas SQL en " +
      "bases de datos de gran volumen.",
    startDate: "2020-03-01T00:00:00.000Z",
    endDate: "2022-12-15T00:00:00.000Z",
  },
  // Educación de MOCK_STUDENT_USERS, para el listado de "Usuarios" del admin.
  {
    educationId: "e-10",
    studentProfileId: "u-10",
    degreeLevel: "LICENCIATURA",
    degreeId: "d-1",
    institution: null,
    description: "Cursando.",
    startDate: "2023-03-01T00:00:00.000Z",
    endDate: null,
  },
  {
    educationId: "e-11",
    studentProfileId: "u-11",
    degreeLevel: "LICENCIATURA",
    degreeId: "d-3",
    institution: null,
    description: "Cursando.",
    startDate: "2022-03-01T00:00:00.000Z",
    endDate: null,
  },
  {
    educationId: "e-12",
    studentProfileId: "u-12",
    degreeLevel: "LICENCIATURA",
    degreeId: "d-4",
    institution: null,
    description: "Cursando.",
    startDate: "2023-03-01T00:00:00.000Z",
    endDate: null,
  },
  {
    educationId: "e-13",
    studentProfileId: "u-13",
    degreeLevel: "LICENCIATURA",
    degreeId: "d-2",
    institution: null,
    description: "Cursando.",
    startDate: "2021-03-01T00:00:00.000Z",
    endDate: null,
  },
  {
    educationId: "e-14",
    studentProfileId: "u-14",
    degreeLevel: "LICENCIATURA",
    degreeId: "d-3",
    institution: null,
    description: "Cursando.",
    startDate: "2022-03-01T00:00:00.000Z",
    endDate: null,
  },
  // Educación de MOCK_APPLICANT_USERS, para el dominio postulaciones.
  {
    educationId: "e-2",
    studentProfileId: "sp-3",
    degreeLevel: "LICENCIATURA",
    degreeId: "d-4",
    institution: null,
    description: "Cursando 3º año.",
    startDate: "2024-03-01T00:00:00.000Z",
    endDate: null,
  },
  {
    educationId: "e-3",
    studentProfileId: "sp-4",
    degreeLevel: "TECNICATURA",
    degreeId: "d-3",
    institution: null,
    description: null,
    startDate: "2022-03-01T00:00:00.000Z",
    endDate: "2025-12-01T00:00:00.000Z",
  },
];

/** Experiencia laboral mock: los dos primeros casos son de `u-1` (para el
 *  detalle de "Mi perfil"); los siguientes, de los postulantes de la vista de
 *  empresa (`sp-*`). Todos los campos son opcionales en el wire. */
export const MOCK_WORK_EXPERIENCE: WorkExperience[] = [
  {
    workExperienceId: "we-1",
    studentProfileId: "u-1",
    company: "DataLab",
    position: "Practicante de Desarrollo",
    startDate: "2025-02-01T00:00:00.000Z",
    endDate: null,
    description:
      "Desarrollo de features en React y TypeScript para el producto principal de la " +
      "empresa, con foco en la capa de UI y su integración con la API interna. Participo " +
      "activamente en code reviews y en la definición de componentes reutilizables para " +
      "el equipo de frontend. También colaboro con el equipo de QA reportando y " +
      "corrigiendo bugs antes de cada release.",
  },
  {
    workExperienceId: "we-2",
    studentProfileId: "u-1",
    company: "Universidad Católica del Uruguay",
    position: "Ayudante de cátedra — Programación I",
    startDate: "2024-03-01T00:00:00.000Z",
    endDate: "2024-12-15T00:00:00.000Z",
    description:
      "Apoyo a estudiantes de primer año en las clases prácticas de Programación I " +
      "(Java): corrección de entregas, resolución de dudas en el horario de consulta " +
      "semanal y armado de guías de ejercicios junto al docente titular.",
  },
  {
    workExperienceId: "we-3",
    studentProfileId: "sp-3",
    company: "Agencia Creativa Sur",
    position: "Asistente de Marketing",
    startDate: "2025-02-01T00:00:00.000Z",
    endDate: "2025-11-30T00:00:00.000Z",
    description: "Apoyo en campañas para redes sociales de clientes locales.",
  },
  {
    workExperienceId: "we-4",
    studentProfileId: "sp-6",
    company: "Radio Universitaria",
    position: "Redactor/a de contenidos",
    startDate: "2024-08-01T00:00:00.000Z",
    endDate: null,
    description: "Producción de notas y contenido para redes.",
  },
];

/**
 * Vacantes para maquetar la tabla de "Mis ofertas" de la empresa, el feed del
 * alumno y la bandeja de moderación del Admin.
 *
 * La mayoría son de `u-2` (DataLab, PK compartida con su `User`); las últimas
 * son de otras empresas para que el filtro por empresa del Admin tenga más de
 * una opción.
 *
 * Estados: casi todas nacen `PUBLICADO` (post-moderación, DEC-01 — es el
 * default y el único visible en el feed). Se deja una en `PENDIENTE` para
 * representar el caso "el Admin la retiró para revisarla" y dos `FINALIZADO`.
 * Ver la tabla de `VacancyStatus` en `types/index.ts`.
 */

/**
 * Fecha calculada, no literal: RF-MOD-01 pide destacar en la bandeja del Admin
 * lo publicado en las últimas 24 h, y con una fecha fija ese resaltado deja de
 * verse al día siguiente de escribir el fixture. Se borra junto con el resto
 * de este archivo cuando exista el backend.
 */
const RECENTLY_PUBLISHED = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
export const MOCK_VACANCIES: Vacancy[] = [
  {
    vacancyId: "v-1",
    companyId: "u-2",
    areaId: "a-2",
    name: "Desarrollador/a Frontend Jr",
    description:
      "En DataLab buscamos a alguien que esté dando sus primeros pasos como " +
      "desarrollador/a frontend para sumarse a nuestro equipo de producto. Vas a " +
      "trabajar codo a codo con desarrolladores senior en el mantenimiento y la " +
      "evolución de nuestras aplicaciones internas, construidas con React y " +
      "TypeScript.\n\nEl día a día incluye implementar componentes de UI a partir de " +
      "diseños en Figma, conectar esos componentes a la capa de datos con TanStack " +
      "Query, y colaborar con el equipo de QA para detectar y corregir bugs antes de " +
      "cada release. Es una pasantía pensada para acompañar tu crecimiento: vas a " +
      "tener un mentor asignado y instancias semanales de code review.",
    requirements:
      "- Estudiante avanzado de Ingeniería en Informática, Analista en Sistemas o " +
      "carreras afines.\n" +
      "- Conocimientos de React y TypeScript (proyectos personales o de la facultad " +
      "cuentan).\n" +
      "- Manejo básico de Git y flujos de trabajo con Pull Requests.\n" +
      "- Ganas de aprender y de recibir feedback técnico de forma constante.\n" +
      "- Disponibilidad de 20 horas semanales, modalidad híbrida (2 días en oficina).",
    contractType: "PASANTIA",
    salary: "$35.000 - $45.000",
    modality: "HIBRIDO",
    status: "PUBLICADO",
    location: "MONTEVIDEO",
    publicationDate: RECENTLY_PUBLISHED,
    reviewedAt: null,
    updatedAt: RECENTLY_PUBLISHED,
    createdAt: RECENTLY_PUBLISHED,
    closingDate: "2026-12-31T00:00:00.000Z",
    deletedAt: null,
    deleted: false,
    reviewedBy: null,
    adminComment: null,
  },
  {
    vacancyId: "v-2",
    companyId: "u-2",
    areaId: "a-3",
    name: "Analista de Datos",
    description:
      "Sumate al equipo de datos de DataLab para dar soporte a los análisis que " +
      "alimentan las decisiones de nuestros clientes. Vas a trabajar extrayendo, " +
      "limpiando y transformando datos de distintas fuentes, y armando reportes y " +
      "dashboards que el equipo comercial y de producto usa todas las semanas.\n\nEs " +
      "una posición part-time, 100% remota, pensada para alguien que ya tiene una " +
      "base sólida en SQL y quiere seguir profundizando en Python para automatizar " +
      "procesos que hoy se hacen a mano.",
    requirements:
      "- SQL a nivel intermedio: joins, agregaciones, subconsultas.\n" +
      "- Python básico (pandas es un plus, no excluyente).\n" +
      "- Comodidad trabajando con planillas grandes y prolijitud en el armado de " +
      "reportes.\n" +
      "- Buena comunicación escrita: gran parte del trabajo es remoto y asincrónico.",
    contractType: "PART_TIME",
    salary: "$40.000 - $55.000",
    modality: "REMOTO",
    status: "FINALIZADO",
    location: "MONTEVIDEO",
    publicationDate: "2026-06-01T14:00:00.000Z",
    reviewedAt: null,
    updatedAt: "2026-07-10T00:00:00.000Z",
    createdAt: "2026-06-01T14:00:00.000Z",
    closingDate: "2026-12-31T00:00:00.000Z",
    deletedAt: null,
    deleted: false,
    reviewedBy: null,
    adminComment: null,
  },
  {
    vacancyId: "v-3",
    companyId: "u-2",
    areaId: "a-6",
    name: "Diseñador/a Gráfico",
    description:
      "Buscamos un/a diseñador/a gráfico para sumarse al equipo creativo que arma " +
      "las piezas digitales de los clientes de DataLab: desde posteos para redes " +
      "sociales hasta banners publicitarios y presentaciones comerciales.\n\nVas a " +
      "trabajar en conjunto con el equipo de marketing para entender el brief de " +
      "cada campaña, proponer conceptos visuales y llevarlos a piezas terminadas, " +
      "cuidando la consistencia de marca de cada cliente. Buscamos a alguien " +
      "prolijo/a, con buen ojo para la tipografía y el color, y que sepa trabajar " +
      "con tiempos de entrega ajustados.",
    requirements:
      "- Manejo avanzado de Figma y Adobe Suite (Illustrator, Photoshop).\n" +
      "- Portfolio con piezas de diseño digital (posteos, banners, presentaciones).\n" +
      "- Conocimientos básicos de identidad de marca y sistemas de diseño.\n" +
      "- Capacidad de trabajar en paralelo en varios proyectos de distintos " +
      "clientes.",
    contractType: "FULL_TIME",
    modality: "HIBRIDO",
    status: "PUBLICADO",
    salary: "$38.000 - $48.000",
    publicationDate: "2026-07-08T09:30:00.000Z",
    reviewedAt: null,
    updatedAt: "2026-07-08T09:30:00.000Z",
    createdAt: "2026-07-08T09:30:00.000Z",
    closingDate: "2026-12-31T00:00:00.000Z",
    deletedAt: null,
    deleted: false,
    reviewedBy: null,
    adminComment: null,
    location: "MONTEVIDEO",
  },
  {
    vacancyId: "v-4",
    companyId: "u-2",
    areaId: "a-5",
    name: "Ejecutivo/a de Cuentas",
    description:
      "DataLab busca un/a ejecutivo/a de cuentas para gestionar la relación " +
      "comercial con una cartera de clientes activos. Vas a ser el punto de " +
      "contacto principal entre el cliente y los equipos internos, asegurando que " +
      "los proyectos avancen según lo acordado y detectando oportunidades para " +
      "ampliar el alcance de cada cuenta.\n\nEl rol combina seguimiento comercial " +
      "(reuniones periódicas, reportes de avance) con una cuota de venta " +
      "consultiva: entender la necesidad del cliente y proponerle soluciones que ya " +
      "ofrecemos o que podemos armar a medida.",
    requirements:
      "- Experiencia previa en ventas B2B o atención a cuentas corporativas.\n" +
      "- Buena comunicación oral y escrita, cómodo/a llevando reuniones con " +
      "clientes.\n" +
      "- Organización para hacer seguimiento de varias cuentas en simultáneo.\n" +
      "- Se valora experiencia en el rubro tecnológico o de consultoría.",
    contractType: "FULL_TIME",
    modality: "HIBRIDO",
    status: "PUBLICADO",
    salary: "$40.000 - $50.000",
    publicationDate: "2026-07-20T09:00:00.000Z",
    reviewedAt: null,
    updatedAt: "2026-07-20T09:00:00.000Z",
    createdAt: "2026-07-20T09:00:00.000Z",
    closingDate: "2026-12-31T00:00:00.000Z",
    deletedAt: null,
    deleted: false,
    reviewedBy: null,
    adminComment: null,
    location: "MONTEVIDEO",
  },
  {
    vacancyId: "v-5",
    companyId: "u-2",
    areaId: "a-2",
    name: "Desarrollador/a Backend Senior",
    description:
      "Buscamos un/a desarrollador/a backend senior para liderar técnicamente el " +
      "equipo de plataforma, la base sobre la que corren todos los productos de " +
      "DataLab. Vas a participar en decisiones de arquitectura, revisar el código " +
      "del equipo y ser referente técnico en Java y Spring Boot.\n\nEs un rol con " +
      "alto grado de autonomía: vas a proponer mejoras de performance y " +
      "escalabilidad, mentorear a desarrolladores más junior, y trabajar en " +
      "estrecha coordinación con el equipo de infraestructura para mantener los " +
      "servicios corriendo de forma confiable.",
    requirements:
      "- 5+ años de experiencia con Java y Spring Boot en producción.\n" +
      "- Experiencia diseñando APIs REST y trabajando con bases de datos " +
      "relacionales.\n" +
      "- Conocimientos de buenas prácticas de testing y CI/CD.\n" +
      "- Se valora experiencia liderando o mentoreando equipos técnicos.",
    contractType: "FULL_TIME",
    modality: "REMOTO",
    status: "FINALIZADO",
    salary: "$90.000 - $120.000",
    publicationDate: "2026-05-20T10:00:00.000Z",
    reviewedAt: null,
    updatedAt: "2026-07-02T18:00:00.000Z",
    createdAt: "2026-05-20T10:00:00.000Z",
    closingDate: "2026-12-31T00:00:00.000Z",
    deletedAt: null,
    deleted: false,
    reviewedBy: null,
    adminComment: null,
    location: "MONTEVIDEO",
  },
  {
    vacancyId: "v-6",
    companyId: "u-2",
    areaId: "a-4",
    name: "Community Manager",
    description:
      "Sumate al equipo de marketing de DataLab para manejar la comunicación en " +
      "redes sociales institucionales de la empresa. Vas a planificar el " +
      "calendario de contenidos, redactar copies, coordinar con diseño las piezas " +
      "gráficas y hacer seguimiento de las métricas de cada canal.\n\nBuscamos a " +
      "alguien con criterio propio para proponer contenido, que entienda el tono " +
      "de cada red social y que pueda responder consultas de la comunidad con " +
      "rapidez y buena onda.",
    requirements:
      "- Portfolio o ejemplos de redes sociales gestionadas previamente.\n" +
      "- Buena redacción y ortografía impecable.\n" +
      "- Manejo de herramientas de programación de contenido (Meta Business Suite, " +
      "Buffer o similares).\n" +
      "- Disponibilidad para trabajar de forma presencial en nuestras oficinas.",
    contractType: "PART_TIME",
    modality: "PRESENCIAL",
    status: "PENDIENTE",
    salary: "$25.000 - $30.000",
    publicationDate: "2026-07-18T15:00:00.000Z",
    // El Admin la retiró para revisión (RF-MOD-01/02): "dar de baja" acá es
    // PUBLICADO → PENDIENTE, no un cierre terminal.
    reviewedAt: "2026-07-21T10:00:00.000Z",
    updatedAt: "2026-07-21T10:00:00.000Z",
    createdAt: "2026-07-18T15:00:00.000Z",
    closingDate: "2026-12-31T00:00:00.000Z",
    deletedAt: null,
    deleted: false,
    reviewedBy: "u-1",
    adminComment: null,
    location: "MONTEVIDEO",
  },
  {
    vacancyId: "v-7",
    companyId: "u-2",
    areaId: "a-4",
    name: "Pasante de Marketing",
    description:
      "Buscamos un/a estudiante de Marketing o Comunicación para sumarse como " +
      "pasante al equipo de marketing de DataLab. Vas a colaborar en la " +
      "planificación y ejecución de campañas para nuestros clientes, desde la " +
      "investigación inicial hasta el armado de reportes de resultados.\n\nEs una " +
      "oportunidad para aprender de punta a punta cómo se arma una campaña " +
      "digital: brief, estrategia, piezas, pauta y medición. Vas a trabajar en " +
      "equipo con perfiles de diseño, contenido y datos.",
    requirements:
      "- Estudiante de Marketing, Comunicación o carreras afines.\n" +
      "- Interés en marketing digital y redes sociales.\n" +
      "- Manejo de herramientas de oficina (planillas, presentaciones).\n" +
      "- Proactividad y ganas de aprender en un equipo chico.",
    contractType: "PASANTIA",
    modality: "PRESENCIAL",
    status: "PUBLICADO",
    salary: "$30.000 - $35.000",
    publicationDate: "2026-07-14T11:00:00.000Z",
    reviewedAt: null,
    updatedAt: "2026-07-14T11:00:00.000Z",
    createdAt: "2026-07-14T11:00:00.000Z",
    closingDate: "2026-12-31T00:00:00.000Z",
    deletedAt: null,
    deleted: false,
    reviewedBy: null,
    adminComment: null,
    location: "MONTEVIDEO",
  },
  {
    vacancyId: "v-8",
    companyId: "u-2",
    areaId: "a-3",
    name: "QA Tester",
    description:
      "DataLab busca un/a QA tester para sumarse al equipo de calidad y asegurar " +
      "que los productos internos lleguen a producción sin sorpresas. Vas a " +
      "diseñar casos de prueba a partir de los requerimientos de cada feature, " +
      "ejecutarlos manualmente y colaborar en la construcción de una suite de " +
      "tests automatizados.\n\nTrabajás en estrecha coordinación con el equipo de " +
      "desarrollo: participás de la planificación de cada sprint, reportás bugs de " +
      "forma clara y priorizada, y validás las correcciones antes de cada release.",
    requirements:
      "- Experiencia diseñando y ejecutando casos de prueba manuales.\n" +
      "- Conocimientos básicos de testing automatizado (Selenium, Cypress o " +
      "similar es un plus).\n" +
      "- Capacidad de reportar bugs de forma clara, con pasos para reproducir.\n" +
      "- Se valora experiencia trabajando en equipos ágiles (Scrum/Kanban).",
    contractType: "FULL_TIME",
    modality: "REMOTO",
    status: "PUBLICADO",
    salary: "$45.000 - $60.000",
    publicationDate: "2026-06-15T13:00:00.000Z",
    reviewedAt: null,
    updatedAt: "2026-06-15T13:00:00.000Z",
    createdAt: "2026-06-15T13:00:00.000Z",
    closingDate: "2026-12-31T00:00:00.000Z",
    deletedAt: null,
    deleted: false,
    reviewedBy: null,
    adminComment: null,
    location: "CANELONES",
  },
  // Vacantes de otras empresas: sin esto el filtro por empresa de la bandeja
  // del Admin ofrece una sola opcion y no se puede probar.
  {
    vacancyId: "v-9",
    companyId: "c-2",
    areaId: "a-2",
    name: "Desarrollador/a Mobile",
    description:
      "Startup Nueva busca sumar una persona al equipo de producto para " +
      "construir la app mobile desde cero, en React Native.",
    requirements: "React Native, TypeScript, manejo de APIs REST.",
    contractType: "FULL_TIME",
    salary: "A convenir",
    modality: "REMOTO",
    status: "PUBLICADO",
    location: "CANELONES",
    publicationDate: "2026-07-22T10:00:00.000Z",
    reviewedAt: null,
    updatedAt: "2026-07-22T10:00:00.000Z",
    createdAt: "2026-07-22T10:00:00.000Z",
    closingDate: "2026-12-31T00:00:00.000Z",
    deletedAt: null,
    deleted: false,
    reviewedBy: null,
    adminComment: null,
  },
  {
    vacancyId: "v-10",
    companyId: "c-3",
    areaId: "a-5",
    name: "Analista de Comercio Exterior",
    description:
      "Agro Sustentable incorpora una persona para la gestion de " +
      "exportaciones y el vinculo con despachantes.",
    requirements: "Formacion en comercio exterior o afines. Ingles avanzado.",
    contractType: "FULL_TIME",
    salary: "A convenir",
    modality: "PRESENCIAL",
    status: "PUBLICADO",
    location: "CANELONES",
    publicationDate: "2026-07-19T08:30:00.000Z",
    reviewedAt: null,
    updatedAt: "2026-07-19T08:30:00.000Z",
    createdAt: "2026-07-19T08:30:00.000Z",
    closingDate: "2026-12-31T00:00:00.000Z",
    deletedAt: null,
    deleted: false,
    reviewedBy: null,
    adminComment: null,
  },
  {
    vacancyId: "v-11",
    companyId: "c-4",
    areaId: "a-4",
    name: "Asistente de Marketing",
    description:
      "Comercial del Este busca una persona para acompanar la ejecucion de " +
      "campanas y la gestion de redes.",
    requirements: "Estudiante avanzado/a de Comunicacion o Marketing.",
    contractType: "PART_TIME",
    salary: "A convenir",
    modality: "HIBRIDO",
    status: "PENDIENTE",
    location: "MALDONADO",
    publicationDate: "2026-07-17T12:00:00.000Z",
    reviewedAt: "2026-07-20T09:00:00.000Z",
    updatedAt: "2026-07-20T09:00:00.000Z",
    createdAt: "2026-07-17T12:00:00.000Z",
    closingDate: "2026-12-31T00:00:00.000Z",
    deletedAt: null,
    deleted: false,
    reviewedBy: "u-1",
    adminComment: null,
  },
];

/**
 * Postulaciones de prueba. `va-1`–`va-7` cubren un caso por estado para
 * maquetar la barra de progreso de "Mis postulaciones" (sin `selected` — ver
 * el aviso en `VacancyApplication`, `types/index.ts`). `va-8`–`va-15`
 * concentran volumen en `v-7` ("Pasante de Marketing") para la vista de
 * postulantes de la empresa.
 */
export const MOCK_APPLICATIONS: VacancyApplication[] = [
  {
    vacancyApplicationId: "va-1",
    vacancyId: "v-1",
    studentProfileId: "u-1",
    status: "PENDIENTE",
    appliedAt: "2026-07-12T11:00:00.000Z",
    accepted: false,
  },
  {
    vacancyApplicationId: "va-2",
    vacancyId: "v-1",
    studentProfileId: "sp-2",
    status: "VISTO",
    appliedAt: "2026-07-11T16:45:00.000Z",
    accepted: false,
  },
  {
    vacancyApplicationId: "va-3",
    vacancyId: "v-2",
    studentProfileId: "u-1",
    status: "FINALIZADO",
    appliedAt: "2026-07-01T08:15:00.000Z",
    accepted: false,
  },
  {
    vacancyApplicationId: "va-4",
    vacancyId: "v-3",
    studentProfileId: "u-1",
    status: "PENDIENTE",
    appliedAt: "2026-07-15T10:00:00.000Z",
    accepted: false,
  },
  {
    vacancyApplicationId: "va-5",
    vacancyId: "v-3",
    studentProfileId: "sp-2",
    status: "VISTO",
    appliedAt: "2026-07-09T12:00:00.000Z",
    accepted: false,
  },
  {
    vacancyApplicationId: "va-6",
    vacancyId: "v-7",
    studentProfileId: "sp-2",
    status: "PENDIENTE",
    appliedAt: "2026-07-16T09:00:00.000Z",
    accepted: false,
  },
  {
    vacancyApplicationId: "va-7",
    vacancyId: "v-8",
    studentProfileId: "u-1",
    status: "FINALIZADO",
    appliedAt: "2026-06-20T09:00:00.000Z",
    accepted: false,
  },
  {
    vacancyApplicationId: "va-8",
    vacancyId: "v-7",
    studentProfileId: "sp-3",
    status: "VISTO",
    appliedAt: "2026-07-14T10:00:00.000Z",
    accepted: false,
  },
  {
    vacancyApplicationId: "va-9",
    vacancyId: "v-7",
    studentProfileId: "sp-4",
    status: "PENDIENTE",
    appliedAt: "2026-07-16T08:30:00.000Z",
    accepted: false,
  },
  {
    vacancyApplicationId: "va-10",
    vacancyId: "v-7",
    studentProfileId: "sp-5",
    status: "VISTO",
    appliedAt: "2026-07-13T09:15:00.000Z",
    accepted: false,
  },
  {
    vacancyApplicationId: "va-11",
    vacancyId: "v-7",
    studentProfileId: "sp-6",
    status: "VISTO",
    appliedAt: "2026-07-13T14:00:00.000Z",
    accepted: false,
  },
  {
    vacancyApplicationId: "va-12",
    vacancyId: "v-7",
    studentProfileId: "sp-7",
    status: "PENDIENTE",
    appliedAt: "2026-07-15T17:20:00.000Z",
    accepted: false,
  },
  {
    vacancyApplicationId: "va-13",
    vacancyId: "v-7",
    studentProfileId: "sp-8",
    status: "FINALIZADO",
    appliedAt: "2026-07-12T09:00:00.000Z",
    accepted: false,
  },
  {
    vacancyApplicationId: "va-14",
    vacancyId: "v-8",
    studentProfileId: "sp-4",
    status: "PENDIENTE",
    appliedAt: "2026-07-17T11:00:00.000Z",
    accepted: false,
  },
  {
    vacancyApplicationId: "va-15",
    vacancyId: "v-8",
    studentProfileId: "sp-2",
    status: "VISTO",
    appliedAt: "2026-07-16T15:00:00.000Z",
    accepted: false,
  },
];
