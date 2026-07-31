"use client";

// Feed de actividad reciente del dashboard: las 3 altas más nuevas entre
// alumnos, empresas y ofertas, mezcladas en un solo ranking global.
//
// ⚠️ **Se deriva en el cliente, a propósito y con costo.** `GET /admin/dashboard`
// (A-28) no devuelve nada de actividad y el backend no tiene un feed cruzado
// entre dominios (`/audit` es auditoría interna, no altas de negocio), así que
// para armarlo hay que traer los listados crudos y ordenarlos acá.
//
// Por eso vive en su PROPIA query en vez de dentro de `use-dashboard.ts`: el
// payload barato del dashboard (1 request) se mantiene barato, y este costo
// queda aislado, medible y fácil de borrar el día que el backend exponga el
// feed. Ver A-31 en `docs/agents/open-questions.md` — el pedido está hecho.

import { useQuery } from "@tanstack/react-query";

import { fetchAllUsers } from "@/features/moderacion/fetch-all-users";
import { parseMontevideoDateTime } from "@/features/moderacion/date-utils";
import type { RecentActivityItem } from "@/features/moderacion/types";
import { apiClient } from "@/lib/api-client";
import type { Company, StudentProfile, User, Vacancy } from "@/types";

const RECENT_ACTIVITY_LIMIT = 3;

/** @public para invalidar el feed después de una acción de moderación. */
export function recentActivityQueryKey() {
  return ["moderacion", "dashboard", "actividad"] as const;
}

export function useRecentActivity() {
  return useQuery({
    queryKey: recentActivityQueryKey(),
    queryFn: ({ signal }) => fetchRecentActivity(signal),
    // Mismo criterio que `use-dashboard.ts`: las altas pueden venir de otra
    // sesión y no invalidan esta caché local.
    refetchOnMount: "always",
  });
}

async function fetchRecentActivity(signal: AbortSignal): Promise<RecentActivityItem[]> {
  const [studentProfiles, companies, vacancies, users] = await Promise.all([
    apiClient.get<StudentProfile[]>("/student-profile", { signal }),
    apiClient.get<Company[]>("/company", { signal }),
    apiClient.get<Vacancy[]>("/vacancy", { signal }),
    fetchAllUsers({}, signal),
  ]);

  return buildRecentActivity(
    studentProfiles,
    companies,
    vacancies.filter((vacancy) => !vacancy.deleted),
    users,
  );
}

interface DatedActivity {
  activity: RecentActivityItem;
  timestamp: number;
}

/**
 * Se juntan las tres entidades y RECIÉN DESPUÉS se ordena y corta: así el top 3
 * es global (puede ser 3 ofertas y ningún alumno), no 3 por dominio.
 *
 * La fecha de alta de alumnos y empresas sale de `User.registeredAt`, no del
 * perfil: el perfil puede completarse mucho después del registro (los dos son
 * pasos separados, ver `roles-and-access-control.md`), así que es la única que
 * representa "cuándo apareció esta cuenta".
 */
function buildRecentActivity(
  studentProfiles: StudentProfile[],
  companies: Company[],
  vacancies: Vacancy[],
  users: User[],
): RecentActivityItem[] {
  const usersById = new Map(users.map((user) => [user.userId, user]));
  const activitiesById = new Map<string, DatedActivity>();

  for (const student of studentProfiles) {
    const user = usersById.get(student.studentProfileId);
    if (!user || user.role !== "ALUMNO") continue;

    addActivity(activitiesById, {
      id: `student:${student.studentProfileId}`,
      title: "Nuevo estudiante registrado",
      description: `${student.name} ${student.surname}`.trim(),
      occurredAt: user.registeredAt,
      href: `/moderacion/estudiantes/${encodeURIComponent(student.studentProfileId)}`,
      type: "user",
    });
  }

  for (const company of companies) {
    const user = usersById.get(company.companyId);
    if (!user || user.role !== "EMPRESA") continue;

    addActivity(activitiesById, {
      id: `company:${company.companyId}`,
      title: "Nueva empresa registrada",
      description: company.name,
      occurredAt: user.registeredAt,
      href: `/moderacion/empresas/${encodeURIComponent(company.companyId)}`,
      type: "company",
    });
  }

  for (const vacancy of vacancies) {
    addActivity(activitiesById, {
      id: `vacancy:${vacancy.vacancyId}`,
      title: "Nueva oferta publicada",
      description: vacancy.name,
      occurredAt: vacancy.createdAt,
      href: `/moderacion/ofertas/${encodeURIComponent(vacancy.vacancyId)}`,
      type: "vacancy",
    });
  }

  return [...activitiesById.values()]
    .sort((a, b) => b.timestamp - a.timestamp || a.activity.id.localeCompare(b.activity.id))
    .slice(0, RECENT_ACTIVITY_LIMIT)
    .map(({ activity }) => activity);
}

/** Descarta las fechas que no parsean en vez de mandarlas al feed con `NaN`,
 *  que las ordenaría de forma arbitraria. */
function addActivity(
  activities: Map<string, DatedActivity>,
  activity: RecentActivityItem,
): void {
  const occurredAt = parseMontevideoDateTime(activity.occurredAt);
  if (!occurredAt) return;

  const datedActivity = { activity, timestamp: occurredAt.getTime() };
  const current = activities.get(activity.id);

  if (!current || datedActivity.timestamp > current.timestamp) {
    activities.set(activity.id, datedActivity);
  }
}
