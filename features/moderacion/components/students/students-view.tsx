"use client";

// Orquestador de "Usuarios" (vista admin, RF-MOD-05): arma el estado de
// filtros/paginación que consumen los componentes de presentación. La
// page.tsx solo renderiza esto. Mismo patrón que
// `features/puestos/components/company-vacancies-view.tsx`.

import { useState } from "react";
import { DownloadIcon } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/layout/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TablePagination } from "@/components/filters/table-pagination";
import {
  useStudentFilterOptions,
  useStudents,
} from "@/features/moderacion/hooks/use-students";
import { StudentsFilters } from "@/features/moderacion/components/students/students-filters";
import { StudentsTable } from "@/features/moderacion/components/students/students-table";
import type { StudentFilters } from "@/features/moderacion/types";

const DEFAULT_FILTERS: StudentFilters = { page: 1, perPage: 10 };

export function StudentsView() {
  // Filtrado inmediato (sin "Aplicar filtros"): cada cambio de filtro vuelve
  // a la página 1.
  const [filters, setFilters] = useState<StudentFilters>(DEFAULT_FILTERS);

  const { data, isLoading, isError } = useStudents(filters);
  const { data: filterOptions } = useStudentFilterOptions();
  const degrees = filterOptions?.degrees ?? [];
  const areas = filterOptions?.areas ?? [];

  const hasAnyStudent = (data?.total ?? 0) > 0 || hasActiveFilters(filters);

  function updateFilters(next: StudentFilters) {
    setFilters({ ...next, page: 1 });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Sin `title`/`description`: el nombre de la sección ya lo muestra el
          Navbar (AGENTS.md, "Header dinámico"). `PageHeader` queda por el slot
          de acciones. */}
      <PageHeader
        actions={
          <Button variant="outline">
            <DownloadIcon />
            Exportar
          </Button>
        }
      />

      <StudentsFilters filters={filters} degrees={degrees} areas={areas} onChange={updateFilters} />

      {isLoading && <TableSkeleton />}

      {!isLoading && isError && (
        <EmptyState
          title="No pudimos cargar los usuarios"
          description="Revisá tu conexión y volvé a intentar."
        />
      )}

      {!isLoading && !isError && data && data.items.length === 0 && (
        <EmptyState
          title={hasAnyStudent ? "No hay usuarios con esos filtros" : "Todavía no hay alumnos registrados"}
          description={
            hasAnyStudent
              ? "Probá ajustando la búsqueda o los filtros."
              : "Los alumnos van a aparecer acá a medida que se registren."
          }
        />
      )}

      {!isLoading && !isError && data && data.items.length > 0 && (
        <>
          <StudentsTable rows={data.items} />
          <TablePagination
            page={data.page}
            perPage={data.perPage}
            total={data.total}
            itemLabel="usuarios"
            onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
            onPerPageChange={(perPage) => setFilters((f) => ({ ...f, perPage, page: 1 }))}
          />
        </>
      )}
    </div>
  );
}

function hasActiveFilters(filters: StudentFilters): boolean {
  return Boolean(filters.search || filters.degreeIds?.length || filters.areaIds?.length);
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
