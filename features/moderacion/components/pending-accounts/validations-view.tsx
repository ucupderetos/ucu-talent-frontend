"use client";

// arma la pantalla de validaciones: dos pestañas (empresas / estudiantes),
// cada una con su hook, sus filtros y su paginacion. la page.tsx solo
// renderiza esto.

import { useState } from "react";
import { SearchIcon, XIcon } from "lucide-react";

import { EmptyState } from "@/components/layout/empty-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TablePagination } from "@/components/filters/table-pagination";
import {
  usePendingCompanies,
  usePendingCompanyIndustries,
} from "@/features/moderacion/hooks/use-pending-companies";
import { usePendingStudents } from "@/features/moderacion/hooks/use-pending-students";
import { PendingCompaniesFiltersBar } from "@/features/moderacion/components/pending-accounts/pending-companies-filters";
import { PendingCompaniesTable } from "@/features/moderacion/components/pending-accounts/pending-companies-table";
import { PendingStudentsTable } from "@/features/moderacion/components/pending-accounts/pending-students-table";
import type { PendingCompaniesFilters, PendingStudentsFilters } from "@/features/moderacion/types";

type Tab = "empresas" | "estudiantes";

const DEFAULT_COMPANY_FILTERS: PendingCompaniesFilters = { page: 1, perPage: 10 };
const DEFAULT_STUDENT_FILTERS: PendingStudentsFilters = { page: 1, perPage: 10 };

export function ValidationsView() {
  const [tab, setTab] = useState<Tab>("empresas");

  // El número de las pestañas es el total SIN filtrar, así que va en una query
  // aparte de la de cada tab (con otro queryKey — es un fetch propio, no el
  // mismo). Con fixtures es gratis; contra la API real conviene que el back
  // exponga el conteo (o un endpoint de solo-total) para no traer toda la lista.
  const companiesCount = usePendingCompanies({}).data?.total ?? 0;
  const studentsCount = usePendingStudents({}).data?.total ?? 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Sin PageHeader: el título de la sección lo muestra el Navbar (header
          dinámico, item "Validaciones" del nav admin) y esta pantalla no tiene
          acción primaria — AGENTS.md, no se renderiza un PageHeader vacío. */}
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
  // Filtrado inmediato (sin borrador + "Aplicar"): mismo criterio que la tab de
  // estudiantes. Cualquier cambio de filtro vuelve a la página 1.
  const [filters, setFilters] = useState<PendingCompaniesFilters>(DEFAULT_COMPANY_FILTERS);

  const { data, isLoading, isError } = usePendingCompanies(filters);
  const industries = usePendingCompanyIndustries();

  const hasAny = (data?.total ?? 0) > 0 || hasCompanyFilters(filters);

  return (
    <>
      <PendingCompaniesFiltersBar
        filters={filters}
        industries={industries}
        onChange={(next) => setFilters({ ...next, page: 1 })}
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
        <div className="flex flex-col gap-2">
          <PendingCompaniesTable rows={data.items} />
          <TablePagination
            page={data.page}
            perPage={data.perPage}
            total={data.total}
            itemLabel="empresas"
            onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
            onPerPageChange={(perPage) => setFilters((f) => ({ ...f, perPage, page: 1 }))}
          />
        </div>
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
      <div className="relative w-full sm:w-96">
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
        <div className="flex flex-col gap-2">
          <PendingStudentsTable rows={data.items} />
          <TablePagination
            page={data.page}
            perPage={data.perPage}
            total={data.total}
            itemLabel="alumnos"
            onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
            onPerPageChange={(perPage) => setFilters((f) => ({ ...f, perPage, page: 1 }))}
          />
        </div>
      )}
    </>
  );
}

function hasCompanyFilters(filters: PendingCompaniesFilters): boolean {
  return Boolean(filters.search || filters.industries?.length);
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
