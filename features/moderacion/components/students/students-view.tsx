"use client";

// Orquestador de "Estudiantes" (vista admin, RF-MOD-05): arma el estado de
// filtros/paginación que consumen los componentes de presentación. La
// page.tsx solo renderiza esto. Mismo patrón que
// `features/puestos/components/company-vacancies-view.tsx`.

import { useState } from "react";

import { EmptyState } from "@/components/layout/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { ListPagination } from "@/components/pagination/list-pagination";
import { useStudentFilterOptions, useStudents } from "@/features/moderacion/hooks/use-students";
import { StudentsFilters } from "@/features/moderacion/components/students/students-filters";
import { StudentsTable } from "@/features/moderacion/components/students/students-table";
import type { StudentFilters } from "@/features/moderacion/types";

const DEFAULT_FILTERS: StudentFilters = { page: 1, perPage: 10 };

export function StudentsView() {
  // Filtrado inmediato (sin "Aplicar filtros"): cada cambio de filtro vuelve
  // a la página 1.
  const [filters, setFilters] = useState<StudentFilters>(DEFAULT_FILTERS);

  const { data, isLoading, isError } = useStudents(filters);
  const { degrees, areas } = useStudentFilterOptions();

  const hasAnyStudent = (data?.total ?? 0) > 0 || hasActiveFilters(filters);

  function updateFilters(next: StudentFilters) {
    setFilters({ ...next, page: 1 });
  }

  return (
    <div className="flex flex-col gap-6">
      <StudentsFilters filters={filters} degrees={degrees} areas={areas} onChange={updateFilters} />

      {isLoading && <TableSkeleton />}

      {!isLoading && isError && (
        <EmptyState
          title="No pudimos cargar los alumnos"
          description="Revisá tu conexión y volvé a intentar."
        />
      )}

      {!isLoading && !isError && data && data.items.length === 0 && (
        <EmptyState
          title={hasAnyStudent ? "No hay alumnos con esos filtros" : "Todavía no hay alumnos registrados"}
          description={
            hasAnyStudent
              ? "Probá ajustando la búsqueda o los filtros."
              : "Los alumnos van a aparecer acá a medida que se registren."
          }
        />
      )}

      {!isLoading && !isError && data && data.items.length > 0 && (
        <div className="space-y-2">
          <StudentsTable rows={data.items} />
          <ListPagination
            page={data.page}
            perPage={data.perPage}
            total={data.total}
            itemLabel="alumnos"
            onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
            onPerPageChange={(perPage) => setFilters((f) => ({ ...f, perPage, page: 1 }))}
          />
        </div>
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
