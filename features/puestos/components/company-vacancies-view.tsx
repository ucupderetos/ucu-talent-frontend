"use client";

// Orquestador de "Mis ofertas" (vista empresa): junta sesión → empresa →
// vacantes, y arma el estado de filtros/paginación que consumen los
// componentes de presentación. La page.tsx solo renderiza esto.

import { useState } from "react";
import Link from "next/link";
import { PlusIcon } from "lucide-react";

import { EmptyState } from "@/components/layout/empty-state";
import { ListPagination } from "@/components/pagination/list-pagination";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useCurrentCompany } from "@/hooks/use-current-company";
import { useSession } from "@/hooks/use-session";
import {
  useCompanyVacancies,
  useCompanyVacancyFilterOptions,
} from "@/features/puestos/hooks/use-company-vacancies";
import { VacancyFilters } from "@/features/puestos/components/vacancy-filters";
import { VacancyTable } from "@/features/puestos/components/vacancy-table";
import type { CompanyVacancyFilters, CompanyVacancyOrder } from "@/features/puestos/types";
import type { AccountStatus } from "@/types";

const DEFAULT_FILTERS: CompanyVacancyFilters = { order: "recent", page: 1, perPage: 5 };

// RN-02 / RF-MOD-04: mismo criterio que `PENDING_STATUS_MESSAGE` de
// `vacancy-detail-view.tsx` (RN-16, gate de "Aplicar") — acá es el gate de
// "Crear nueva oferta".
const BLOCKED_STATUS_MESSAGE: Partial<Record<AccountStatus, string>> = {
  PENDIENTE:
    "Tu cuenta está pendiente de aprobación. Vas a poder publicar vacantes cuando se apruebe.",
  RECHAZADO: "Tu cuenta no fue aprobada, así que no podés publicar vacantes.",
};

export function CompanyVacanciesView() {
  const { user } = useSession();
  const { company, isLoading: isLoadingCompany } = useCurrentCompany();

  // RN-02 / RF-MOD-04: el estado no restringe el acceso, restringe la acción
  // de publicar puestos. `User.status` es la fuente canónica (`docs/agents/roles-and-access-control.md`), no
  // `Company.status` (mismo valor duplicado, pero éste ya está en la sesión
  // sin fetch extra).
  const canCreateOffer = user?.status === "APROBADO";

  // Filtrado inmediato (sin "Aplicar filtros"): cada cambio de filtro vuelve
  // a la página 1, mismo criterio que el resto de las pantallas con
  // paginación (ver `updateFilters`/`changeOrder` abajo).
  const [filters, setFilters] = useState<CompanyVacancyFilters>(DEFAULT_FILTERS);

  const { data, isLoading: isLoadingVacancies, isError } = useCompanyVacancies(
    company?.companyId,
    filters,
  );

  const { areas, locations } = useCompanyVacancyFilterOptions(company?.companyId);

  const isLoading = isLoadingCompany || isLoadingVacancies;
  const hasAnyVacancy = (data?.total ?? 0) > 0 || hasActiveFilters(filters);

  function updateFilters(next: CompanyVacancyFilters) {
    setFilters({ ...next, page: 1 });
  }

  // Ordenar no es lo mismo que filtrar (`docs/agents/design-system.md`), pero también se aplica de
  // inmediato y también vuelve a la página 1: con otro orden, la página en la
  // que estabas muestra filas distintas.
  function changeOrder(order: CompanyVacancyOrder) {
    setFilters((f) => ({ ...f, order, page: 1 }));
  }

  return (
    <div className="flex flex-col gap-6">

      <div className="flex items-center justify-between gap-4">
        <VacancyFilters
          filters={filters}
          areas={areas}
          locations={locations}
          onChange={updateFilters}
          onOrderChange={changeOrder}
        />

        <CreateOfferAction canCreateOffer={canCreateOffer} status={user?.status} />
      </div>

      {isLoading && <TableSkeleton />}

      {!isLoading && isError && (
        <EmptyState
          title="No pudimos cargar tus ofertas"
          description="Revisá tu conexión y volvé a intentar."
        />
      )}

      {!isLoading && !isError && data && data.items.length === 0 && (
        <EmptyState
          title={hasAnyVacancy ? "No hay ofertas con esos filtros" : "Todavía no publicaste ofertas"}
          description={
            hasAnyVacancy
              ? "Probá ajustando la búsqueda o los filtros."
              : "Creá tu primera oferta para empezar a recibir postulantes."
          }
        />
      )}

      {!isLoading && !isError && data && data.items.length > 0 && (
        <>
          <VacancyTable rows={data.items} />
          <ListPagination
            page={data.page}
            perPage={data.perPage}
            total={data.total}
            itemLabel="ofertas"
            onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
            onPerPageChange={(perPage) => setFilters((f) => ({ ...f, perPage, page: 1 }))}
          />
        </>
      )}
    </div>
  );
}

/** Botón "Crear nueva oferta" con el gate de RN-02 (cuenta no `APROBADO`). El
 *  layout del wizard (`crear-oferta/layout.tsx`) repite el mismo gate por si
 *  se llega por URL directa — acá solo se evita el click. */
function CreateOfferAction({
  canCreateOffer,
  status,
}: {
  canCreateOffer: boolean;
  status: AccountStatus | undefined;
}) {
  if (canCreateOffer) {
    return (
      <Button asChild className="bg-ucu-blue text-white hover:bg-ucu-blue/90">
        <Link href="/crear-oferta/informacion-basica">
          <PlusIcon />
          Crear nueva oferta
        </Link>
      </Button>
    );
  }

  const blockedMessage = status && BLOCKED_STATUS_MESSAGE[status];

  return (
    <Tooltip>
      {/* El `<span>` (no el `Button` deshabilitado) es el trigger real:
          `disabled:pointer-events-none` del propio `Button` le impediría
          recibir el hover que dispara el tooltip (mismo patrón que
          `vacancy-table.tsx`). */}
      <TooltipTrigger asChild>
        <span className="inline-flex">
          <Button
            disabled
            className="pointer-events-none bg-ucu-blue text-white"
          >
            <PlusIcon />
            Crear nueva oferta
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent>
        {blockedMessage ?? "Todavía no podés publicar vacantes."}
      </TooltipContent>
    </Tooltip>
  );
}

function hasActiveFilters(filters: CompanyVacancyFilters): boolean {
  return Boolean(
    filters.search ||
    filters.statuses?.length ||
    filters.areaIds?.length ||
    filters.locations?.length ||
    filters.publishedFrom ||
    filters.publishedTo,
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-2 rounded-xl border p-4">
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
    </div>
  );
}
