"use client";

// arma la pantalla de validaciones: dos pestañas (empresas / estudiantes),
// cada una con su hook, sus filtros y su paginacion. la page.tsx solo
// renderiza esto.

import { useMemo, useState } from "react";
import { DownloadIcon, SearchIcon, XIcon } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/layout/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TablePagination } from "@/components/filters/table-pagination";
import { usePendingCompanies } from "@/features/moderacion/hooks/use-pending-companies";
import { usePendingStudents } from "@/features/moderacion/hooks/use-pending-students";
import { PendingCompaniesFiltersBar } from "@/features/moderacion/components/pending-accounts/pending-companies-filters";
import { PendingCompaniesTable } from "@/features/moderacion/components/pending-accounts/pending-companies-table";
import { PendingStudentsTable } from "@/features/moderacion/components/pending-accounts/pending-students-table";
import type { PendingCompaniesFilters, PendingStudentsFilters } from "@/features/moderacion/types";
import { MOCK_COMPANIES } from "@/lib/fixtures";

type Tab = "empresas" | "estudiantes";

const DEFAULT_COMPANY_FILTERS: PendingCompaniesFilters = { page: 1, perPage: 10 };
const DEFAULT_STUDENT_FILTERS: PendingStudentsFilters = { page: 1, perPage: 10 };

export function ValidationsView() {
  const [tab, setTab] = useState<Tab>("empresas");

  // el numero de las pestañas es sin filtrar, por eso lo pido acá aparte de
  // lo que pide cada tab (misma query, no se duplica el fetch)
  const companiesCount = usePendingCompanies({}).data?.total ?? 0;
  const studentsCount = usePendingStudents({}).data?.total ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Validaciones"
        description="Revisá y aprobá las solicitudes de empresas y estudiantes antes de que operen en la plataforma."
        actions={
          <Button variant="outline">
            <DownloadIcon />
            Exportar
          </Button>
        }
      />

      <Tabs value={tab} onValueChange={(value) => setTab(value as Tab)}>
        <TabsList>
          <TabsTrigger value="empresas">Empresas ({companiesCount})</TabsTrigger>
          <TabsTrigger value="estudiantes">Estudiantes ({studentsCount})</TabsTrigger>
        </TabsList>
      </Tabs>

      {tab === "empresas" && <CompaniesTab />}
      {tab === "estudiantes" && <StudentsTab />}
    </div>
  );
}

function CompaniesTab() {
  const [draftFilters, setDraftFilters] = useState<PendingCompaniesFilters>(
    DEFAULT_COMPANY_FILTERS,
  );
  const [appliedFilters, setAppliedFilters] = useState<PendingCompaniesFilters>(
    DEFAULT_COMPANY_FILTERS,
  );

  const { data, isLoading, isError } = usePendingCompanies(appliedFilters);
  const industries = useCompanyIndustryOptions();

  const hasAny = (data?.total ?? 0) > 0 || hasCompanyFilters(appliedFilters);
  const activeCount = appliedFilters.industries?.length ?? 0;

  function applyFilters() {
    setAppliedFilters((current) => ({
      ...current,
      search: draftFilters.search,
      industries: draftFilters.industries,
      page: 1,
    }));
  }

  function clearFilters() {
    setDraftFilters(DEFAULT_COMPANY_FILTERS);
    setAppliedFilters(DEFAULT_COMPANY_FILTERS);
  }

  return (
    <>
      <PendingCompaniesFiltersBar
        filters={draftFilters}
        industries={industries}
        activeCount={activeCount}
        onChange={setDraftFilters}
        onApply={applyFilters}
        onClear={clearFilters}
        canApply={hasFieldsChanged(draftFilters, appliedFilters)}
        canClear={hasCompanyFilters(draftFilters) || hasCompanyFilters(appliedFilters)}
      />

      {isLoading && <TableSkeleton />}

      {!isLoading && isError && (
        <EmptyState
          title="No pudimos cargar las empresas"
          description="Revisá tu conexión y volvé a intentar."
        />
      )}

      {!isLoading && !isError && data && data.items.length === 0 && (
        <EmptyState
          title={hasAny ? "No hay empresas con esos filtros" : "No hay empresas pendientes"}
          description={hasAny ? "Probá ajustando la búsqueda o los filtros." : undefined}
        />
      )}

      {!isLoading && !isError && data && data.items.length > 0 && (
        <>
          <PendingCompaniesTable rows={data.items} />
          <TablePagination
            page={data.page}
            perPage={data.perPage}
            total={data.total}
            itemLabel="empresas"
            onPageChange={(page) => setAppliedFilters((f) => ({ ...f, page }))}
            onPerPageChange={(perPage) => setAppliedFilters((f) => ({ ...f, perPage, page: 1 }))}
          />
        </>
      )}
    </>
  );
}

function StudentsTab() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<PendingStudentsFilters>(DEFAULT_STUDENT_FILTERS);

  const { data, isLoading, isError } = usePendingStudents(filters);

  function updateSearch(value: string) {
    setSearch(value);
    setFilters((f) => ({ ...f, search: value, page: 1 }));
  }

  return (
    <>
      <div className="relative w-full sm:w-64">
        <SearchIcon
          className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          value={search}
          onChange={(e) => updateSearch(e.target.value)}
          placeholder="Buscar por nombre, email o cédula…"
          className="pl-8 pr-8"
          aria-label="Buscar alumnos"
        />
        {search && (
          <button
            type="button"
            onClick={() => updateSearch("")}
            className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Limpiar búsqueda"
          >
            <XIcon className="size-4" />
          </button>
        )}
      </div>

      {isLoading && <TableSkeleton />}

      {!isLoading && isError && (
        <EmptyState
          title="No pudimos cargar los alumnos"
          description="Revisá tu conexión y volvé a intentar."
        />
      )}

      {!isLoading && !isError && data && data.items.length === 0 && (
        <EmptyState
          title={search ? "No hay alumnos con esos filtros" : "No hay alumnos pendientes"}
          description={search ? "Probá ajustando la búsqueda." : undefined}
        />
      )}

      {!isLoading && !isError && data && data.items.length > 0 && (
        <>
          <PendingStudentsTable rows={data.items} />
          <TablePagination
            page={data.page}
            perPage={data.perPage}
            total={data.total}
            itemLabel="alumnos"
            onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
            onPerPageChange={(perPage) => setFilters((f) => ({ ...f, perPage, page: 1 }))}
          />
        </>
      )}
    </>
  );
}

function hasCompanyFilters(filters: PendingCompaniesFilters): boolean {
  return Boolean(filters.search || filters.industries?.length);
}

function hasFieldsChanged(
  draft: PendingCompaniesFilters,
  applied: PendingCompaniesFilters,
): boolean {
  return (
    (draft.search ?? "") !== (applied.search ?? "") ||
    !sameValues(draft.industries, applied.industries)
  );
}

function sameValues<T>(a: T[] = [], b: T[] = []): boolean {
  if (a.length !== b.length) return false;
  const setB = new Set(b);
  return a.every((value) => setB.has(value));
}

// opciones del multiselect de industria: solo las que alguna empresa
// pendiente tiene, para no ofrecer opciones vacias.
function useCompanyIndustryOptions(): string[] {
  return useMemo(() => Array.from(new Set(MOCK_COMPANIES.map((c) => c.industry))).sort(), []);
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
