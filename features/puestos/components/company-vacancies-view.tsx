"use client";

// Orquestador de "Mis ofertas" (vista empresa): junta sesión → empresa →
// vacantes, y arma el estado de filtros/paginación que consumen los
// componentes de presentación. La page.tsx solo renderiza esto.

import { useState } from "react";
import Link from "next/link";
import { PlusIcon } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/layout/empty-state";
import { ListPagination } from "@/components/pagination/list-pagination";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentCompany } from "@/features/auth/hooks/use-current-company";
import {
  useCompanyVacancies,
  useCompanyVacancyFilterOptions,
} from "@/features/puestos/hooks/use-company-vacancies";
import { VacancyFilters } from "@/features/puestos/components/vacancy-filters";
import { VacancyTable } from "@/features/puestos/components/vacancy-table";
import type { CompanyVacancyFilters, CompanyVacancyOrder } from "@/features/puestos/types";

const DEFAULT_FILTERS: CompanyVacancyFilters = { order: "recent", page: 1, perPage: 5 };

export function CompanyVacanciesView() {
  const { company, isLoading: isLoadingCompany } = useCurrentCompany();

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

  // Ordenar no es lo mismo que filtrar (AGENTS.md), pero también se aplica de
  // inmediato y también vuelve a la página 1: con otro orden, la página en la
  // que estabas muestra filas distintas.
  function changeOrder(order: CompanyVacancyOrder) {
    setFilters((f) => ({ ...f, order, page: 1 }));
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        actions={
          // CTA principal de la pantalla: color de marca explícito
          // (`bg-ucu-blue`), no un token — ver "Colores" en AGENTS.md.
          <Button asChild className="bg-ucu-blue text-white hover:bg-ucu-blue/90">
            <Link href="/crear-oferta/informacion-basica">
              <PlusIcon />
              Crear nueva oferta
            </Link>
          </Button>
        }
      />

      <VacancyFilters
        filters={filters}
        areas={areas}
        locations={locations}
        onChange={updateFilters}
        onOrderChange={changeOrder}
      />

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
