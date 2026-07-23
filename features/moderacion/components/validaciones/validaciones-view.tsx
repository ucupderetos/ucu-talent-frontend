"use client";

// arma toda la pantalla de validaciones junta los datos del hook con el
// estado de los filtros y el orden, y se lo pasa a los componentes.

import { useMemo, useState } from "react";
import { DownloadIcon } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ValidacionesFilters } from "@/features/moderacion/components/validaciones/validaciones-filters";
import { EmpresasPendientesTable } from "@/features/moderacion/components/validaciones/empresas-pendientes-table";
import { useValidaciones } from "@/features/moderacion/hooks/use-validaciones";

export function ValidacionesView() {
  const { empresas, isLoading, error } = useValidaciones();

  const [search, setSearch] = useState("");
  const [categoria, setCategoria] = useState("all");
  const [solicitadoPor, setSolicitadoPor] = useState("all");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const categorias = useMemo(
    () => Array.from(new Set(empresas.map((e) => e.rubro))).sort(),
    [empresas],
  );
  const solicitantes = useMemo(
    () => Array.from(new Set(empresas.map((e) => e.cargo))).sort(),
    [empresas],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return empresas
      .filter((e) => {
        const matchesQuery =
          query === "" ||
          e.empresa.toLowerCase().includes(query) ||
          e.contacto.toLowerCase().includes(query) ||
          e.email.toLowerCase().includes(query);
        const matchesCategoria = categoria === "all" || e.rubro === categoria;
        const matchesSolicitante = solicitadoPor === "all" || e.cargo === solicitadoPor;

        return matchesQuery && matchesCategoria && matchesSolicitante;
      })
      .sort((a, b) => {
        const delta = new Date(a.solicitadaAt).getTime() - new Date(b.solicitadaAt).getTime();
        return sortDirection === "asc" ? delta : -delta;
      });
  }, [empresas, search, categoria, solicitadoPor, sortDirection]);

  const hasActiveFilters = search !== "" || categoria !== "all" || solicitadoPor !== "all";

  function clearFilters() {
    setSearch("");
    setCategoria("all");
    setSolicitadoPor("all");
  }

  if (isLoading) return <Skeleton className="h-96 w-full" />;
  if (error) return <p className="text-sm text-destructive">No pudimos cargar las validaciones.</p>;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Validaciones"
        description="Revisá y aprobá las solicitudes de empresas antes de que operen en la plataforma."
        actions={
          <Button variant="outline">
            <DownloadIcon data-icon="inline-start" />
            Exportar
          </Button>
        }
      />

      <ValidacionesFilters
        search={search}
        categoria={categoria}
        solicitadoPor={solicitadoPor}
        categorias={categorias}
        solicitantes={solicitantes}
        onSearchChange={setSearch}
        onCategoriaChange={setCategoria}
        onSolicitadoPorChange={setSolicitadoPor}
        onClear={clearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      <EmpresasPendientesTable
        rows={filtered}
        onToggleSort={() =>
          setSortDirection((current) => (current === "asc" ? "desc" : "asc"))
        }
      />
    </div>
  );
}
