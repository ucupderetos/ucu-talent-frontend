import type {

  ApplicationStatusSummary,

  PendingCompanyValidation,

  RecentActivityItem,

  RecentVacancy,

} from "../types";

// Datos temporales para desarrollar la interfaz.
// Eliminar cuando el dashboard consuma la API real.

export const recentVacanciesMock: RecentVacancy[] = [
  {
    id: 1,
    position: "Pasante de Marketing",
    company: "Tech Solutions S.A.",
    publishedAt: "14/07/2026",
    applications: 18,
    status: "published",
  },
  {
    id: 2,
    position: "Ejecutivo de Cuentas",
    company: "Mares Construcción",
    publishedAt: "13/07/2026",
    applications: 0,
    status: "finalized",
  },
  {
    id: 3,
    position: "Diseñador/a Gráfico",
    company: "Estudio Creativo",
    publishedAt: "10/07/2026",
    applications: 32,
    status: "published",
  },
  {
    id: 4,
    position: "Desarrollador Frontend",
    company: "Software UY",
    publishedAt: "02/07/2026",
    applications: 46,
    status: "finalized",
  },
  {
    id: 5,
    position: "Community Manager",
    company: "Agencia Digital",
    publishedAt: "30/06/2026",
    applications: null,
    status: "rejected",
  },
];

export const pendingCompanyValidationsMock: PendingCompanyValidation[] = [
  {
    id: 1,
    name: "Innovatech S.A.",
    description: "Empresa pendiente de aprobación",
    registeredAt: "14/07/2026",
  },
  {
    id: 2,
    name: "Digital Works",
    description: "Empresa pendiente de aprobación",
    registeredAt: "13/07/2026",
  },
  {
    id: 3,
    name: "Tech Group Uruguay",
    description: "Empresa pendiente de aprobación",
    registeredAt: "12/07/2026",
  },
];


export const recentActivitiesMock: RecentActivityItem[] = [
  {
    id: 1,
    title: "Nueva empresa registrada",
    description: "Tech Solutions S.A.",
    time: "Hace 2 horas",
    type: "company",
  },
  {
    id: 2,
    title: "Nueva oferta publicada",
    description: "Desarrollador Frontend",
    time: "Hace 3 horas",
    type: "vacancy",
  },
  {
    id: 3,
    title: "Nueva postulación recibida",
    description: "Pasante de Marketing",
    time: "Hace 4 horas",
    type: "application",
  },
  {
    id: 4,
    title: "Usuario registrado",
    description: "María Fernández",
    time: "Hace 6 horas",
    type: "user",
  },
 
];

export const applicationsByStatusMock: ApplicationStatusSummary[] = [
  {
    status: "pending",
    label: "Pendientes",
    count: 48,
    percentage: 38,
  },
  {
    status: "aproved",
    label: "Aceptadas",
    count: 34,
    percentage: 27,
  },
  
  {
    status: "rejected",
    label: "Rechazadas",
    count: 18,
    percentage: 14,
  },
];