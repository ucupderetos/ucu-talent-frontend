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
 *  `useCurrentCompany()` nunca la encuentra y "Mis ofertas" queda vacío
 *  aunque haya vacantes cargadas. */
export const MOCK_COMPANIES: Company[] = [
  {
    companyId: "u-2",
    name: "DataLab",
    industry: "Tecnología",
    description: "Consultora de datos y software.",
    webUrl: "https://datalab.com.uy",
    linkedinUrl: "https://linkedin.com/company/datalab",
    location: "MONTEVIDEO",
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
  },
  // Perfiles de MOCK_STUDENT_USERS, para el listado de "Usuarios" del admin.
  {
    studentProfileId: "u-10",
    name: "María",
    surname: "Fernández",
    documentType: "CEDULA_IDENTIDAD",
    documentNumber: "41234567",
    phoneNumber: "099000010",
    linkedinUrl: null,
    skills: ["React", "TypeScript"],
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
  },
];

export const MOCK_EDUCATION: Education[] = [
  {
    educationId: "e-1",
    studentProfileId: "u-1",
    degreeLevel: "LICENCIATURA",
    degreeId: "d-1",
    description: "Cursando 4º año.",
    startDate: "2023-03-01T00:00:00.000Z",
    endDate: null,
  },
  // Educación de MOCK_STUDENT_USERS, para el listado de "Usuarios" del admin.
  {
    educationId: "e-10",
    studentProfileId: "u-10",
    degreeLevel: "LICENCIATURA",
    degreeId: "d-1",
    description: "Cursando.",
    startDate: "2023-03-01T00:00:00.000Z",
    endDate: null,
  },
  {
    educationId: "e-11",
    studentProfileId: "u-11",
    degreeLevel: "LICENCIATURA",
    degreeId: "d-3",
    description: "Cursando.",
    startDate: "2022-03-01T00:00:00.000Z",
    endDate: null,
  },
  {
    educationId: "e-12",
    studentProfileId: "u-12",
    degreeLevel: "LICENCIATURA",
    degreeId: "d-4",
    description: "Cursando.",
    startDate: "2023-03-01T00:00:00.000Z",
    endDate: null,
  },
  {
    educationId: "e-13",
    studentProfileId: "u-13",
    degreeLevel: "LICENCIATURA",
    degreeId: "d-2",
    description: "Cursando.",
    startDate: "2021-03-01T00:00:00.000Z",
    endDate: null,
  },
  {
    educationId: "e-14",
    studentProfileId: "u-14",
    degreeLevel: "LICENCIATURA",
    degreeId: "d-3",
    description: "Cursando.",
    startDate: "2022-03-01T00:00:00.000Z",
    endDate: null,
  },
];

/**
 * Vacantes de `u-2` (DataLab, PK compartida con su `User`), para maquetar la
 * tabla de "Mis ofertas" de la empresa con varios casos.
 *
 * ⚠️ El backend real hoy SOLO soporta `VacancyStatus: PENDIENTE | FINALIZADO`
 * (ver el gap documentado en `types/index.ts` — no existe "publicado",
 * "pausado" ni "rechazado" todavía, aunque el MER de referencia ya los
 * modela). Los casos de abajo que en el MER serían "publicado"/"pausado"/
 * "rechazado" quedan como `PENDIENTE` — es lo más parecido a "activa" que el
 * enum real permite hoy — y se recuperan como estados propios apenas el
 * backend los exponga (A-14 en `AGENTS.md`).
 */
export const MOCK_VACANCIES: Vacancy[] = [
  {
    vacancyId: "v-1",
    companyId: "u-2",
    areaId: "a-2",
    name: "Desarrollador/a Frontend Jr",
    description: "React y TypeScript. Pasantía de 20 hs semanales.",
    requirements: "Estudiante avanzado. React, Git.",
    contractType: "Pasantía",
    salaryRange: "$35.000 - $45.000",
    modality: "HIBRIDO",
    status: "PENDIENTE",
    location: "MONTEVIDEO",
    publicationDate: null,
    closingDate: null,
  },
  {
    vacancyId: "v-2",
    companyId: "u-2",
    areaId: "a-3",
    name: "Analista de Datos",
    description: "SQL y Python.",
    requirements: "SQL intermedio, Python básico.",
    contractType: "Part-time",
    salaryRange: "$40.000 - $55.000",
    modality: "REMOTO",
    status: "FINALIZADO",
    location: "MONTEVIDEO",
    publicationDate: "2026-06-01T14:00:00.000Z",
    closingDate: "2026-07-10T00:00:00.000Z",
  },
  {
    vacancyId: "v-3",
    companyId: "u-2",
    areaId: "a-6",
    name: "Diseñador/a Gráfico",
    description: "Piezas para campañas digitales de clientes de DataLab.",
    requirements: "Figma, Adobe Suite.",
    contractType: "Full-time",
    modality: "HIBRIDO",
    status: "PENDIENTE",
    salaryRange: "$38.000 - $48.000",
    publicationDate: "2026-07-08T09:30:00.000Z",
    closingDate: null,
    location: "MONTEVIDEO",
  },
  {
    vacancyId: "v-4",
    companyId: "u-2",
    areaId: "a-5",
    name: "Ejecutivo/a de Cuentas",
    description: "Gestión comercial de la cartera de clientes.",
    requirements: "Experiencia en ventas B2B.",
    contractType: "Full-time",
    modality: "HIBRIDO",
    status: "PENDIENTE",
    salaryRange: "$40.000 - $50.000",
    publicationDate: null,
    closingDate: null,
    location: "MONTEVIDEO",
  },
  {
    vacancyId: "v-5",
    companyId: "u-2",
    areaId: "a-2",
    name: "Desarrollador/a Backend Senior",
    description: "Java y Spring Boot para el equipo de plataforma.",
    requirements: "5+ años con Java/Spring.",
    contractType: "Full-time",
    modality: "REMOTO",
    status: "FINALIZADO",
    salaryRange: "$90.000 - $120.000",
    publicationDate: "2026-05-20T10:00:00.000Z",
    closingDate: "2026-07-02T18:00:00.000Z",
    location: "MONTEVIDEO",
  },
  {
    vacancyId: "v-6",
    companyId: "u-2",
    areaId: "a-4",
    name: "Community Manager",
    description: "Manejo de redes sociales institucionales.",
    requirements: "Portfolio de redes gestionadas.",
    contractType: "Part-time",
    modality: "PRESENCIAL",
    status: "PENDIENTE",
    salaryRange: "$25.000 - $30.000",
    publicationDate: null,
    closingDate: null,
    location: "MONTEVIDEO",
  },
  {
    vacancyId: "v-7",
    companyId: "u-2",
    areaId: "a-4",
    name: "Pasante de Marketing",
    description: "Apoyo al equipo de marketing en campañas y contenido.",
    requirements: "Estudiante de Marketing o Comunicación.",
    contractType: "Pasantía",
    modality: "PRESENCIAL",
    status: "PENDIENTE",
    salaryRange: "$30.000 - $35.000",
    publicationDate: "2026-07-14T11:00:00.000Z",
    closingDate: null,
    location: "MONTEVIDEO",
  },
  {
    vacancyId: "v-8",
    companyId: "u-2",
    areaId: "a-3",
    name: "QA Tester",
    description: "Testing manual y automatizado de productos internos.",
    requirements: "Experiencia con casos de prueba y bugs.",
    contractType: "Full-time",
    modality: "REMOTO",
    status: "PENDIENTE",
    salaryRange: "$45.000 - $60.000",
    publicationDate: "2026-06-15T13:00:00.000Z",
    closingDate: null,
    location: "CANELONES",
  },
];

/** Una postulación por cada estado, para poder maquetar los 3 casos. */
export const MOCK_APPLICATIONS: VacancyApplication[] = [
  {
    vacancyApplicationId: "va-1",
    vacancyId: "v-1",
    studentProfileId: "u-1",
    status: "PENDIENTE",
    appliedAt: "2026-07-12T11:00:00.000Z",
  },
  {
    vacancyApplicationId: "va-2",
    vacancyId: "v-1",
    studentProfileId: "sp-2",
    status: "VISTO",
    appliedAt: "2026-07-11T16:45:00.000Z",
  },
  {
    vacancyApplicationId: "va-3",
    vacancyId: "v-2",
    studentProfileId: "u-1",
    status: "FINALIZADO",
    appliedAt: "2026-07-01T08:15:00.000Z",
  },
  {
    vacancyApplicationId: "va-4",
    vacancyId: "v-3",
    studentProfileId: "u-1",
    status: "PENDIENTE",
    appliedAt: "2026-07-15T10:00:00.000Z",
  },
  {
    vacancyApplicationId: "va-5",
    vacancyId: "v-3",
    studentProfileId: "sp-2",
    status: "VISTO",
    appliedAt: "2026-07-09T12:00:00.000Z",
  },
  {
    vacancyApplicationId: "va-6",
    vacancyId: "v-7",
    studentProfileId: "sp-2",
    status: "PENDIENTE",
    appliedAt: "2026-07-16T09:00:00.000Z",
  },
];
