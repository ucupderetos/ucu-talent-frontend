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

export const MOCK_USERS: Record<Role, User> = {
  student: {
    id: "u-1",
    name: "Lucía",
    surname: "Fernández",
    email: "lucia.fernandez@correo.ucu.edu.uy",
    role: "student",
    phoneNumber: "099123456",
    documentType: "cedula",
    documentNumber: "5.123.456-7",
    linkedinUrl: "https://linkedin.com/in/lucia-fernandez",
    registeredAt: "2026-03-01T10:00:00.000Z",
  },
  company: {
    // Para una empresa, `name` es el nombre de la empresa: el MER no tiene
    // `Company.name`. TODO: confirmar qué trae `surname` en este caso.
    id: "u-2",
    name: "DataLab",
    surname: "",
    email: "contacto@datalab.com.uy",
    role: "company",
    phoneNumber: "26001234",
    documentType: "cedula",
    documentNumber: "4.987.654-3",
    linkedinUrl: "https://linkedin.com/company/datalab",
    registeredAt: "2026-02-15T09:00:00.000Z",
  },
  admin: {
    id: "u-3",
    name: "Admin",
    surname: "UCU",
    email: "talento@ucu.edu.uy",
    role: "admin",
    phoneNumber: "24872717",
    documentType: "cedula",
    documentNumber: "3.111.222-3",
    linkedinUrl: "",
    registeredAt: "2026-01-10T08:00:00.000Z",
  },
};

/** Áreas jerárquicas: son el mecanismo del match del RF-14. */
export const MOCK_AREAS: Area[] = [
  { id: "a-1", name: "Tecnología", parentAreaId: null },
  { id: "a-2", name: "Desarrollo de Software", parentAreaId: "a-1" },
  { id: "a-3", name: "Datos", parentAreaId: "a-1" },
  { id: "a-4", name: "Marketing y Publicidad", parentAreaId: null },
  { id: "a-5", name: "Comercial", parentAreaId: null },
  { id: "a-6", name: "Diseño", parentAreaId: null },
];

export const MOCK_DEGREES: Degree[] = [
  { id: "d-1", areaId: "a-2", name: "Ingeniería en Informática", isUcu: true },
  { id: "d-2", areaId: "a-3", name: "Analista en Sistemas", isUcu: true },
];

export const MOCK_COMPANIES: Company[] = [
  {
    id: "c-1",
    userId: "u-2",
    industry: "Tecnología",
    description: "Consultora de datos y software.",
    webUrl: "https://datalab.com.uy",
    linkedinUrl: "https://linkedin.com/company/datalab",
    location: "Montevideo",
    approved: true,
  },
  {
    // Para probar el gate de RF-13: esta todavía no puede operar.
    id: "c-2",
    userId: "u-5",
    industry: "Software",
    description: "Startup recién registrada.",
    webUrl: "https://startup.com.uy",
    linkedinUrl: "",
    location: "Canelones",
    approved: false,
  },
];

export const MOCK_STUDENT_PROFILES: StudentProfile[] = [
  { id: "sp-1", userId: "u-1", skills: ["React", "TypeScript", "SQL"] },
  { id: "sp-2", userId: "u-4", skills: ["Python", "SQL"] },
];

export const MOCK_EDUCATION: Education[] = [
  {
    id: "e-1",
    studentProfileId: "sp-1",
    degreeId: "d-1",
    description: "Cursando 4º año.",
    startDate: "2023-03-01T00:00:00.000Z",
    endDate: null,
  },
];

/**
 * Vacantes de `c-1` (DataLab): al menos una por cada estado del MER, para
 * poder maquetar los 5 casos en la tabla de "Mis ofertas" de la empresa.
 */
export const MOCK_VACANCIES: Vacancy[] = [
  {
    id: "v-1",
    companyId: "c-1",
    areaId: "a-2",
    name: "Desarrollador/a Frontend Jr",
    description: "React y TypeScript. Pasantía de 20 hs semanales.",
    requirements: "Estudiante avanzado. React, Git.",
    contractType: "Pasantía",
    modality: "hybrid",
    status: "published",
    salaryRange: "$35.000 - $45.000",
    publishedAt: "2026-07-10T14:00:00.000Z",
    closedAt: null,
    location: "Montevideo",
  },
  {
    // Esperando aprobación de Admin UCU: no la ve nadie en el feed todavía.
    id: "v-2",
    companyId: "c-1",
    areaId: "a-3",
    name: "Analista de Datos",
    description: "SQL y Python.",
    requirements: "SQL intermedio, Python básico.",
    contractType: "Part-time",
    modality: "remote",
    status: "pending",
    salaryRange: "$40.000 - $55.000",
    publishedAt: null,
    closedAt: null,
    location: "Montevideo",
  },
  {
    id: "v-3",
    companyId: "c-1",
    areaId: "a-6",
    name: "Diseñador/a Gráfico",
    description: "Piezas para campañas digitales de clientes de DataLab.",
    requirements: "Figma, Adobe Suite.",
    contractType: "Full-time",
    modality: "hybrid",
    status: "published",
    salaryRange: "$38.000 - $48.000",
    publishedAt: "2026-07-08T09:30:00.000Z",
    closedAt: null,
    location: "Montevideo",
  },
  {
    // Otra pendiente de aprobación, para probar más de un caso en la cola.
    id: "v-4",
    companyId: "c-1",
    areaId: "a-5",
    name: "Ejecutivo/a de Cuentas",
    description: "Gestión comercial de la cartera de clientes.",
    requirements: "Experiencia en ventas B2B.",
    contractType: "Full-time",
    modality: "hybrid",
    status: "pending",
    salaryRange: "$40.000 - $50.000",
    publishedAt: null,
    closedAt: null,
    location: "Montevideo",
  },
  {
    id: "v-5",
    companyId: "c-1",
    areaId: "a-2",
    name: "Desarrollador/a Backend Senior",
    description: "Java y Spring Boot para el equipo de plataforma.",
    requirements: "5+ años con Java/Spring.",
    contractType: "Full-time",
    modality: "remote",
    status: "closed",
    salaryRange: "$90.000 - $120.000",
    publishedAt: "2026-05-20T10:00:00.000Z",
    closedAt: "2026-07-02T18:00:00.000Z",
    location: "Montevideo",
  },
  {
    // Admin UCU la rechazó: nunca llegó a publicarse.
    id: "v-6",
    companyId: "c-1",
    areaId: "a-4",
    name: "Community Manager",
    description: "Manejo de redes sociales institucionales.",
    requirements: "Portfolio de redes gestionadas.",
    contractType: "Part-time",
    modality: "onsite",
    status: "rejected",
    salaryRange: "$25.000 - $30.000",
    publishedAt: null,
    closedAt: null,
    location: "Montevideo",
  },
  {
    id: "v-7",
    companyId: "c-1",
    areaId: "a-4",
    name: "Pasante de Marketing",
    description: "Apoyo al equipo de marketing en campañas y contenido.",
    requirements: "Estudiante de Marketing o Comunicación.",
    contractType: "Pasantía",
    modality: "onsite",
    status: "published",
    salaryRange: "$30.000 - $35.000",
    publishedAt: "2026-07-14T11:00:00.000Z",
    closedAt: null,
    location: "Montevideo",
  },
  {
    // Publicada y luego pausada por la empresa: sigue teniendo publishedAt.
    id: "v-8",
    companyId: "c-1",
    areaId: "a-3",
    name: "QA Tester",
    description: "Testing manual y automatizado de productos internos.",
    requirements: "Experiencia con casos de prueba y bugs.",
    contractType: "Full-time",
    modality: "remote",
    status: "paused",
    salaryRange: "$45.000 - $60.000",
    publishedAt: "2026-06-15T13:00:00.000Z",
    closedAt: null,
    location: "Canelones",
  },
];

/** Una postulación por cada estado, para poder maquetar los 3 casos. */
export const MOCK_APPLICATIONS: VacancyApplication[] = [
  {
    id: "va-1",
    vacancyId: "v-1",
    studentProfileId: "sp-1",
    status: "PENDIENTE",
    appliedAt: "2026-07-12T11:00:00.000Z",
  },
  {
    id: "va-2",
    vacancyId: "v-1",
    studentProfileId: "sp-2",
    status: "VISTO",
    appliedAt: "2026-07-11T16:45:00.000Z",
  },
  {
    id: "va-3",
    vacancyId: "v-1",
    studentProfileId: "sp-1",
    status: "FINALIZADO",
    appliedAt: "2026-07-01T08:15:00.000Z",
  },
  {
    id: "va-4",
    vacancyId: "v-3",
    studentProfileId: "sp-1",
    status: "PENDIENTE",
    appliedAt: "2026-07-15T10:00:00.000Z",
  },
  {
    id: "va-5",
    vacancyId: "v-3",
    studentProfileId: "sp-2",
    status: "VISTO",
    appliedAt: "2026-07-09T12:00:00.000Z",
  },
  {
    id: "va-6",
    vacancyId: "v-7",
    studentProfileId: "sp-2",
    status: "PENDIENTE",
    appliedAt: "2026-07-16T09:00:00.000Z",
  },
];
