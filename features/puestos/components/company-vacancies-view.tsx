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

  // Los filtros solo se buscan al presionar "Aplicar filtros": `draftFilters`
  // es lo que el usuario va tocando en los inputs, `appliedFilters` es lo que
  // realmente le llega al hook de datos. La paginación es la excepción: sí
  // actúa de inmediato, no es parte del "borrador".
  const [draftFilters, setDraftFilters] = useState<CompanyVacancyFilters>(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<CompanyVacancyFilters>(DEFAULT_FILTERS);

  const { data, isLoading: isLoadingVacancies, isError } = useCompanyVacancies(
    company?.companyId,
    appliedFilters,
  );

  const { areas, locations } = useCompanyVacancyOptions(company?.companyId);

  const isLoading = isLoadingCompany || isLoadingVacancies;
  const hasAnyVacancy = (data?.total ?? 0) > 0 || hasActiveFilters(appliedFilters);

  function applyFilters() {
    setAppliedFilters({ ...draftFilters, page: 1 });
  }

  function clearFilters() {
    setDraftFilters(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Ofertas"
        description="Gestioná todas las ofertas de tu empresa. Podés ver su estado, postulantes y rendimiento."
        actions={
          <Button
            className="bg-sidebar text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={() => toast.info("Crear oferta todavía no está disponible.")}
          >
            <PlusIcon />
            Crear nueva oferta
          </Button>
        }
      />

      <VacancyFilters
        filters={draftFilters}
        areas={areas}
        locations={locations}
        onChange={setDraftFilters}
        onApply={applyFilters}
        onClear={clearFilters}
        canApply={hasFilterFieldsChanged(draftFilters, appliedFilters)}
        canClear={hasActiveFilters(draftFilters) || hasActiveFilters(appliedFilters)}
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
            onPageChange={(page) => setAppliedFilters((f) => ({ ...f, page }))}
            onPerPageChange={(perPage) => setAppliedFilters((f) => ({ ...f, perPage, page: 1 }))}
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
      filters.locations?.length,
  );
}

/** Compara borrador vs. aplicado para habilitar "Aplicar filtros" — ignora
 *  `page`/`perPage`, que no son parte del borrador que edita la barra de
 *  filtros. `statuses`/`areaIds`/`locations` son multi-selección, así que se
 *  comparan como conjuntos (el orden en que se van tildando no importa). */
function hasFilterFieldsChanged(
  draft: CompanyVacancyFilters,
  applied: CompanyVacancyFilters,
): boolean {
  return (
    (draft.search ?? "") !== (applied.search ?? "") ||
    !sameValues(draft.statuses, applied.statuses) ||
    !sameValues(draft.areaIds, applied.areaIds) ||
    !sameValues(draft.locations, applied.locations) ||
    (draft.order ?? "recent") !== (applied.order ?? "recent")
  );
}

function sameValues<T>(a: T[] = [], b: T[] = []): boolean {
  if (a.length !== b.length) return false;
  const setB = new Set(b);
  return a.every((value) => setB.has(value));
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
      areas: MOCK_AREAS.filter((area) => areaIds.has(area.areaId)),
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
