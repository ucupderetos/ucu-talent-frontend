"use client";

// Orquestador de "Mis ofertas" (vista empresa): junta sesión → empresa →
// vacantes, y arma el estado de filtros/paginación que consumen los
// componentes de presentación. La page.tsx solo renderiza esto.

import { useMemo, useState } from "react";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/layout/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentCompany } from "@/features/puestos/hooks/use-current-company";
import { useCompanyVacancies } from "@/features/puestos/hooks/use-company-vacancies";
import { VacancyFilters } from "@/features/puestos/components/vacancy-filters";
import { VacancyTable } from "@/features/puestos/components/vacancy-table";
import { VacancyPagination } from "@/features/puestos/components/vacancy-pagination";
import type { CompanyVacancyFilters } from "@/features/puestos/types";
import { MOCK_AREAS, MOCK_VACANCIES } from "@/lib/fixtures";

const DEFAULT_FILTERS: CompanyVacancyFilters = { order: "recent", page: 1, perPage: 5 };

export function CompanyVacanciesView() {
  const { company, isLoading: isLoadingCompany } = useCurrentCompany();
  const [filters, setFilters] = useState<CompanyVacancyFilters>(DEFAULT_FILTERS);

  const { data, isLoading: isLoadingVacancies, isError } = useCompanyVacancies(
    company?.id,
    filters,
  );

  const { areas, locations } = useCompanyVacancyOptions(company?.id);

  const isLoading = isLoadingCompany || isLoadingVacancies;
  const hasAnyVacancy = (data?.total ?? 0) > 0 || hasActiveFilters(filters);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Ofertas"
        description="Gestioná todas las ofertas de tu empresa. Podés ver su estado, postulantes y rendimiento."
        actions={
          <Button onClick={() => toast.info("Crear oferta todavía no está disponible.")}>
            <PlusIcon />
            Crear nueva oferta
          </Button>
        }
      />

      <VacancyFilters
        filters={filters}
        areas={areas}
        locations={locations}
        onChange={setFilters}
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
          <VacancyPagination
            page={data.page}
            perPage={data.perPage}
            total={data.total}
            onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
            onPerPageChange={(perPage) => setFilters((f) => ({ ...f, perPage, page: 1 }))}
          />
        </>
      )}
    </div>
  );
}

function hasActiveFilters(filters: CompanyVacancyFilters): boolean {
  return Boolean(filters.search || filters.status || filters.areaId || filters.location);
}

/**
 * Opciones de los selects de área/ubicación: se calculan sobre TODAS las
 * vacantes de la empresa (sin aplicar los filtros activos), para que el
 * dropdown no vaya perdiendo opciones a medida que se filtra.
 *
 * TODO(api): cuando exista el contrato, esto probablemente lo devuelva el
 * propio endpoint de filtros (facets) en vez de calcularse en el cliente.
 */
function useCompanyVacancyOptions(companyId: string | undefined) {
  return useMemo(() => {
    const ownVacancies = MOCK_VACANCIES.filter((v) => v.companyId === companyId);
    const areaIds = new Set(ownVacancies.map((v) => v.areaId));
    const locations = Array.from(new Set(ownVacancies.map((v) => v.location))).sort();

    return {
      areas: MOCK_AREAS.filter((area) => areaIds.has(area.id)),
      locations,
    };
  }, [companyId]);
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
