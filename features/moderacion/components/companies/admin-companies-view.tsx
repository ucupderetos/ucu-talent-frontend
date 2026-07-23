"use client";

import { useMemo, useState } from "react";

import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { adminCompaniesMock } from "@/features/moderacion/data/companies-mock";
import type {
  AdminCompanyFilters,
  AdminCompanyRow,
} from "@/features/moderacion/types";

import { CompaniesFilters } from "./companies-filters";
import { CompaniesPagination } from "./companies-pagination";
import { CompaniesTable } from "./companies-table";

const DEFAULT_FILTERS: AdminCompanyFilters = {
  search: "",
  status: "TODAS",
  industry: "TODAS",
  page: 1,
  perPage: 5,
};

export function AdminCompaniesView() {
  const [draftFilters, setDraftFilters] =
    useState<AdminCompanyFilters>(DEFAULT_FILTERS);

  const [filters, setFilters] =
    useState<AdminCompanyFilters>(DEFAULT_FILTERS);

  const industries = useMemo(
    () =>
      Array.from(
        new Set(adminCompaniesMock.map((company) => company.industry)),
      ).sort(),
    [],
  );

  const filteredCompanies = useMemo(
    () => filterCompanies(adminCompaniesMock, filters),
    [filters],
  );

  const paginatedCompanies = useMemo(() => {
    const start = (filters.page - 1) * filters.perPage;
    const end = start + filters.perPage;

    return filteredCompanies.slice(start, end);
  }, [filteredCompanies, filters.page, filters.perPage]);

  function handleApplyFilters() {
    setFilters({
      ...draftFilters,
      page: 1,
    });
  }

  function handleClearFilters() {
    setDraftFilters(DEFAULT_FILTERS);
    setFilters(DEFAULT_FILTERS);
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Empresas"
        description="Gestioná todas las empresas registradas en la plataforma."
      />

      <CompaniesFilters
        filters={draftFilters}
        industries={industries}
        onChange={setDraftFilters}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
      />

      {filteredCompanies.length === 0 ? (
        <EmptyState
          title="No se encontraron empresas"
          description="Probá cambiando la búsqueda o limpiando los filtros."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <CompaniesTable companies={paginatedCompanies} />

          <CompaniesPagination
            page={filters.page}
            perPage={filters.perPage}
            total={filteredCompanies.length}
            onPageChange={(page) =>
              setFilters((currentFilters) => ({
                ...currentFilters,
                page,
              }))
            }
            onPerPageChange={(perPage) =>
              setFilters((currentFilters) => ({
                ...currentFilters,
                perPage,
                page: 1,
              }))
            }
          />
        </div>
      )}
    </div>
  );
}

function filterCompanies(
  companies: AdminCompanyRow[],
  filters: AdminCompanyFilters,
): AdminCompanyRow[] {
  const normalizedSearch = filters.search.trim().toLowerCase();

  return companies.filter((company) => {
    const matchesSearch =
      normalizedSearch.length === 0 ||
      company.name.toLowerCase().includes(normalizedSearch) ||
      company.email.toLowerCase().includes(normalizedSearch);

    const matchesStatus =
      filters.status === "TODAS" || company.status === filters.status;

    const matchesIndustry =
      filters.industry === "TODAS" ||
      company.industry === filters.industry;

    return matchesSearch && matchesStatus && matchesIndustry;
  });
}