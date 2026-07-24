"use client";

// Orquestador de "Usuarios" (vista admin, RF-MOD-05): arma el estado de
// filtros/paginación que consumen los componentes de presentación. La
// page.tsx solo renderiza esto. Mismo patrón que
// `features/puestos/components/company-vacancies-view.tsx`.

import { useMemo, useState } from "react";
import { DownloadIcon } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/layout/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TablePagination } from "@/components/filters/table-pagination";
import { useStudents } from "@/features/moderacion/hooks/use-students";
import { StudentsFilters } from "@/features/moderacion/components/students/students-filters";
import { StudentsTable } from "@/features/moderacion/components/students/students-table";
import type { StudentFilters } from "@/features/moderacion/types";
import { MOCK_AREAS, MOCK_DEGREES, MOCK_EDUCATION } from "@/lib/fixtures";

const DEFAULT_FILTERS: StudentFilters = { page: 1, perPage: 10 };

export function StudentsView() {
  // Los filtros solo se buscan al presionar "Aplicar filtros": `draftFilters`
  // es lo que el usuario va tocando en los inputs, `appliedFilters` es lo que
  // realmente le llega al hook de datos.
  const [draftFilters, setDraftFilters] = useState<StudentFilters>(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<StudentFilters>(DEFAULT_FILTERS);

  const { data, isLoading, isError } = useStudents(appliedFilters);
  const { degrees, areas } = useStudentFilterOptions();

  const hasAnyStudent = (data?.total ?? 0) > 0 || hasActiveFilters(appliedFilters);
  const activeFilterCount = countActiveFilters(appliedFilters);

  function applyFilters() {
    setAppliedFilters((current) => ({
      ...current,
      search: draftFilters.search,
      degreeIds: draftFilters.degreeIds,
      areaIds: draftFilters.areaIds,
      page: 1,
    }));
  }

  function clearFilters() {
    setDraftFilters(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
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

      <StudentsFilters
        filters={draftFilters}
        degrees={degrees}
        areas={areas}
        activeCount={activeFilterCount}
        onChange={setDraftFilters}
        onApply={applyFilters}
        onClear={clearFilters}
        canApply={hasFilterFieldsChanged(draftFilters, appliedFilters)}
        canClear={hasActiveFilters(draftFilters) || hasActiveFilters(appliedFilters)}
      />

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
            onPageChange={(page) => setAppliedFilters((f) => ({ ...f, page }))}
            onPerPageChange={(perPage) => setAppliedFilters((f) => ({ ...f, perPage, page: 1 }))}
          />
        </>
      )}
    </div>
  );
}

function hasActiveFilters(filters: StudentFilters): boolean {
  return Boolean(filters.search || filters.degreeIds?.length || filters.areaIds?.length);
}

/** Cuenta los filtros del popover ya aplicados — `search` no cuenta porque el
 *  input ya está siempre visible en la barra (mismo criterio que puestos). */
function countActiveFilters(filters: StudentFilters): number {
  return (filters.degreeIds?.length ?? 0) + (filters.areaIds?.length ?? 0);
}

function hasFilterFieldsChanged(draft: StudentFilters, applied: StudentFilters): boolean {
  return (
    (draft.search ?? "") !== (applied.search ?? "") ||
    !sameValues(draft.degreeIds, applied.degreeIds) ||
    !sameValues(draft.areaIds, applied.areaIds)
  );
}

function sameValues<T>(a: T[] = [], b: T[] = []): boolean {
  if (a.length !== b.length) return false;
  const setB = new Set(b);
  return a.every((value) => setB.has(value));
}

/** Opciones de los MultiSelect: solo las carreras/áreas que algún alumno
 *  mockeado realmente cursa, para que el dropdown no ofrezca opciones vacías.
 *  Mismo criterio que `useCompanyVacancyOptions` en puestos. */
function useStudentFilterOptions() {
  return useMemo(() => {
    const degreeIds = new Set(MOCK_EDUCATION.map((e) => e.degreeId));
    const degrees = MOCK_DEGREES.filter((degree) => degreeIds.has(degree.degreeId));
    const areaIds = new Set(degrees.map((degree) => degree.areaId));
    const areas = MOCK_AREAS.filter((area) => areaIds.has(area.areaId));

    return { degrees, areas };
  }, []);
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
