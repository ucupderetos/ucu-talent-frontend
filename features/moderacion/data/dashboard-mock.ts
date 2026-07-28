// 🔴 Datos de prueba del dashboard de Admin. Se borran cuando exista el
// endpoint de métricas — los consume `hooks/use-dashboard.ts`, ningún
// componente los importa directo.
//
// Viven acá y no en `lib/fixtures.ts` (donde está el resto de los mocks) por la
// dirección de las dependencias: sus tipos son view models de `features/
// moderacion/types.ts`, y `lib/` no importa nunca desde `features/`.

import type {
  ApplicationStatusSummary,
  DashboardStat,
  PendingCompanyValidation,
  RecentActivityItem,
  RecentVacancy,
} from "@/features/moderacion/types";

export const MOCK_DASHBOARD_STATS: DashboardStat[] = [
  { id: "companies", title: "Empresas registradas", value: "126", weeklyChange: "+8 esta semana" },
  { id: "vacancies", title: "Ofertas publicadas", value: "248", weeklyChange: "+15 esta semana" },
  { id: "applications", title: "Postulaciones", value: "1.842", weeklyChange: "+120 esta semana" },
  { id: "users", title: "Usuarios registrados", value: "2.356", weeklyChange: "+95 esta semana" },
];

export const MOCK_RECENT_VACANCIES: RecentVacancy[] = [
  {
    id: "rv-1",
    position: "Pasante de Marketing",
    company: "Tech Solutions S.A.",
    publishedAt: "2026-07-14T10:00:00.000Z",
    applications: 18,
    status: "PENDIENTE",
  },
  {
    id: "rv-2",
    position: "Ejecutivo de Cuentas",
    company: "Mares Construcción",
    publishedAt: "2026-07-13T10:00:00.000Z",
    applications: 0,
    status: "FINALIZADO",
  },
  {
    id: "rv-3",
    position: "Diseñador/a Gráfico",
    company: "Estudio Creativo",
    publishedAt: "2026-07-10T10:00:00.000Z",
    applications: 32,
    status: "PENDIENTE",
  },
  {
    id: "rv-4",
    position: "Desarrollador Frontend",
    company: "Software UY",
    publishedAt: "2026-07-02T10:00:00.000Z",
    applications: 46,
    status: "FINALIZADO",
  },
  {
    id: "rv-5",
    position: "Community Manager",
    company: "Agencia Digital",
    publishedAt: "2026-06-30T10:00:00.000Z",
    applications: null,
    status: "FINALIZADO",
  },
];

export const MOCK_PENDING_VALIDATIONS: PendingCompanyValidation[] = [
  {
    id: "pv-1",
    name: "Innovatech S.A.",
    description: "Empresa pendiente de aprobación",
    registeredAt: "2026-07-14T10:00:00.000Z",
  },
  {
    id: "pv-2",
    name: "Digital Works",
    description: "Empresa pendiente de aprobación",
    registeredAt: "2026-07-13T10:00:00.000Z",
  },
  {
    id: "pv-3",
    name: "Tech Group Uruguay",
    description: "Empresa pendiente de aprobación",
    registeredAt: "2026-07-12T10:00:00.000Z",
  },
];

export const MOCK_RECENT_ACTIVITY: RecentActivityItem[] = [
  {
    id: "ra-1",
    title: "Nueva empresa registrada",
    description: "Tech Solutions S.A.",
    time: "Hace 2 horas",
    type: "company",
  },
  {
    id: "ra-2",
    title: "Nueva oferta publicada",
    description: "Desarrollador Frontend",
    time: "Hace 3 horas",
    type: "vacancy",
  },
  {
    id: "ra-3",
    title: "Nueva postulación recibida",
    description: "Pasante de Marketing",
    time: "Hace 4 horas",
    type: "application",
  },
  {
    id: "ra-4",
    title: "Usuario registrado",
    description: "María Fernández",
    time: "Hace 6 horas",
    type: "user",
  },
];

export const MOCK_APPLICATIONS_BY_STATUS: ApplicationStatusSummary[] = [
  { status: "PENDIENTE", label: "Pendientes", count: 48 },
  { status: "VISTO", label: "Vistas", count: 34 },
  { status: "FINALIZADA", label: "Finalizadas", count: 18 },
];
