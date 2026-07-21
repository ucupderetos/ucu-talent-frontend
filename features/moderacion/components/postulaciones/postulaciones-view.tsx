"use client";

// arma toda la pantalla de postulaciones: junta los datos del hook con el
// estado de los filtros, el orden y la paginacion, y se lo pasa a los
// componentes. esto es lo unico que renderiza la page.

import { useMemo, useState } from "react";
import { DownloadIcon } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PostulacionesFilters } from "@/features/moderacion/components/postulaciones/postulaciones-filters";
import { PostulacionesTable } from "@/features/moderacion/components/postulaciones/postulaciones-table";
import { PostulacionesPagination } from "@/features/moderacion/components/postulaciones/postulaciones-pagination";
import { usePostulaciones } from "@/features/moderacion/hooks/use-postulaciones";

export function PostulacionesView() {
  const { postulaciones, isLoading, error } = usePostulaciones();

  const [search, setSearch] = useState("");
  const [oferta, setOferta] = useState("all");
  const [empresa, setEmpresa] = useState("all");
  const [estado, setEstado] = useState("all");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const ofertas = useMemo(
    () => Array.from(new Set(postulaciones.map((p) => p.oferta))).sort(),
    [postulaciones],
  );
  const empresas = useMemo(
    () => Array.from(new Set(postulaciones.map((p) => p.empresa))).sort(),
    [postulaciones],
  );
  const estados = useMemo(
    () => Array.from(new Set(postulaciones.map((p) => p.estado))),
    [postulaciones],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return postulaciones
      .filter((p) => {
        const matchesQuery =
          query === "" ||
          `${p.name} ${p.surname}`.toLowerCase().includes(query) ||
          p.email.toLowerCase().includes(query) ||
          p.oferta.toLowerCase().includes(query);
        const matchesOferta = oferta === "all" || p.oferta === oferta;
        const matchesEmpresa = empresa === "all" || p.empresa === empresa;
        const matchesEstado = estado === "all" || p.estado === estado;

        return matchesQuery && matchesOferta && matchesEmpresa && matchesEstado;
      })
      .sort((a, b) => {
        const delta = new Date(a.appliedAt).getTime() - new Date(b.appliedAt).getTime();
        return sortDirection === "asc" ? delta : -delta;
      });
  }, [postulaciones, search, oferta, empresa, estado, sortDirection]);

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const hasActiveFilters =
    search !== "" || oferta !== "all" || empresa !== "all" || estado !== "all";

  function clearFilters() {
    setSearch("");
    setOferta("all");
    setEmpresa("all");
    setEstado("all");
    setPage(1);
  }

  if (isLoading) return <Skeleton className="h-96 w-full" />;
  if (error) return <p className="text-sm text-destructive">No pudimos cargar las postulaciones.</p>;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Postulaciones"
        description="Visualizá todas las postulaciones realizadas a las ofertas publicadas."
        actions={
          <Button variant="outline">
            <DownloadIcon data-icon="inline-start" />
            Exportar
          </Button>
        }
      />

      <PostulacionesFilters
        search={search}
        oferta={oferta}
        empresa={empresa}
        estado={estado}
        ofertas={ofertas}
        empresas={empresas}
        estados={estados}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onOfertaChange={(value) => {
          setOferta(value);
          setPage(1);
        }}
        onEmpresaChange={(value) => {
          setEmpresa(value);
          setPage(1);
        }}
        onEstadoChange={(value) => {
          setEstado(value);
          setPage(1);
        }}
        onClear={clearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      <PostulacionesTable
        rows={paginated}
        onToggleSort={() =>
          setSortDirection((current) => (current === "asc" ? "desc" : "asc"))
        }
      />

      <PostulacionesPagination
        page={page}
        perPage={perPage}
        total={filtered.length}
        onPageChange={setPage}
        onPerPageChange={(value) => {
          setPerPage(value);
          setPage(1);
        }}
      />
    </div>
  );
}
