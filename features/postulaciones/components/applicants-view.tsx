"use client";

// Orquestador de "Postulantes" (vista empresa, cruzada a todas sus ofertas):
// junta sesión → empresa → postulantes, y arma el estado de
// filtros/paginación que consumen los componentes de presentación. El detalle
// de un postulante es una página propia (/postulantes/[id],
// applicant-detail-view.tsx), no vive acá. La page.tsx solo renderiza esto
// (dentro de un Suspense, por `useSearchParams`).
//
// `?vacancyId=` (opcional): entrada directa desde "Ver postulantes" de una
// oferta puntual (`features/puestos/components/vacancy-table.tsx`) — pre-filtra
// sin que la empresa tenga que volver a elegirla a mano.

import { useState } from "react";
import { useSearchParams } from "next/navigation";

import { EmptyState } from "@/components/layout/empty-state";
import { ListPagination } from "@/components/pagination/list-pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentCompany } from "@/hooks/use-current-company";
import { useCompanyApplicants } from "@/features/postulaciones/hooks/use-company-applicants";
import { useCompanyVacancyOptions } from "@/features/postulaciones/hooks/use-company-vacancy-options";
import { ApplicantFiltersBar } from "@/features/postulaciones/components/applicant-filters";
import { ApplicantTable } from "@/features/postulaciones/components/applicant-table";
import type { ApplicantFilters } from "@/features/postulaciones/types";

const DEFAULT_FILTERS: ApplicantFilters = { order: "recent", page: 1, perPage: 10 };

export function ApplicantsView() {
  const searchParams = useSearchParams();
  const vacancyIdFromUrl = searchParams.get("vacancyId");

  const initialFilters: ApplicantFilters = vacancyIdFromUrl
    ? { ...DEFAULT_FILTERS, vacancyIds: [vacancyIdFromUrl] }
    : DEFAULT_FILTERS;

  const { company, isLoading: isLoadingCompany } = useCurrentCompany();

  const [filters, setFilters] = useState<ApplicantFilters>(initialFilters);

  const { data, isLoading: isLoadingApplicants, isError } = useCompanyApplicants(
    company?.companyId,
    filters,
  );

  const vacancyOptions = useCompanyVacancyOptions(company?.companyId);

  const isLoading = isLoadingCompany || isLoadingApplicants;
  const hasAnyApplicant = (data?.total ?? 0) > 0 || hasActiveFilters(filters);

  return (
    <div className="flex flex-col gap-6">
      <ApplicantFiltersBar
        filters={filters}
        vacancyOptions={vacancyOptions}
        onChange={setFilters}
      />

      {isLoading && <TableSkeleton />}

      {!isLoading && isError && (
        <EmptyState
          title="No pudimos cargar tus postulantes"
          description="Revisá tu conexión y volvé a intentar."
        />
      )}

      {!isLoading && !isError && data && (
        <>
          {data.items.length === 0 ? (
            <EmptyState
              title={hasAnyApplicant ? "No hay postulantes con esos filtros" : "Todavía no tenés postulantes"}
              description={
                hasAnyApplicant
                  ? "Probá ajustando la búsqueda o los filtros."
                  : "Cuando alguien se postule a tus ofertas, va a aparecer acá."
              }
            />
          ) : (
            <>
              <ApplicantTable rows={data.items} />
              <ListPagination
                page={data.page}
                perPage={data.perPage}
                total={data.total}
                itemLabel="postulantes"
                onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
                onPerPageChange={(perPage) => setFilters((f) => ({ ...f, perPage, page: 1 }))}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}

function hasActiveFilters(filters: ApplicantFilters): boolean {
  return Boolean(filters.search || filters.vacancyIds?.length || filters.statuses?.length);
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
