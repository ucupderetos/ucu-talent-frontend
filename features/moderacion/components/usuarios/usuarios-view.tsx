"use client";

// arma toda la pantalla de usuarios: junta los datos del hook con el estado
// de los filtros, el orden y la paginacion, y se lo pasa a los componentes.
// esto es lo unico que renderiza la page.

import { useMemo, useState } from "react";
import { DownloadIcon } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { UsuariosFilters } from "@/features/moderacion/components/usuarios/usuarios-filters";
import { UsuariosTable } from "@/features/moderacion/components/usuarios/usuarios-table";
import { UsuariosPagination } from "@/features/moderacion/components/usuarios/usuarios-pagination";
import { useUsuarios } from "@/features/moderacion/hooks/use-usuarios";

export function UsuariosView() {
  const { usuarios, isLoading, error } = useUsuarios();

  const [search, setSearch] = useState("");
  const [degree, setDegree] = useState("all");
  const [area, setArea] = useState("all");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const areas = useMemo(
    () => Array.from(new Set(usuarios.map((u) => u.area))).sort(),
    [usuarios],
  );
  const degrees = useMemo(
    () => Array.from(new Set(usuarios.map((u) => u.degree))).sort(),
    [usuarios],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return usuarios
      .filter((usuario) => {
        const matchesQuery =
          query === "" ||
          `${usuario.name} ${usuario.surname}`.toLowerCase().includes(query) ||
          usuario.email.toLowerCase().includes(query) ||
          usuario.documentNumber.includes(query);
        const matchesDegree = degree === "all" || usuario.degree === degree;
        const matchesArea = area === "all" || usuario.area === area;

        return matchesQuery && matchesDegree && matchesArea;
      })
      .sort((a, b) => {
        const delta = new Date(a.registeredAt).getTime() - new Date(b.registeredAt).getTime();
        return sortDirection === "asc" ? delta : -delta;
      });
  }, [usuarios, search, degree, area, sortDirection]);

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const hasActiveFilters = search !== "" || degree !== "all" || area !== "all";

  function clearFilters() {
    setSearch("");
    setDegree("all");
    setArea("all");
    setPage(1);
  }

  if (isLoading) return <Skeleton className="h-96 w-full" />;
  if (error) return <p className="text-sm text-destructive">No pudimos cargar los usuarios.</p>;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Usuarios"
        description="Gestioná todos los usuarios registrados en la plataforma (alumnos y exalumnos)."
        actions={
          <Button variant="outline">
            <DownloadIcon data-icon="inline-start" />
            Exportar
          </Button>
        }
      />

      <UsuariosFilters
        search={search}
        degree={degree}
        area={area}
        degrees={degrees}
        areas={areas}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onDegreeChange={(value) => {
          setDegree(value);
          setPage(1);
        }}
        onAreaChange={(value) => {
          setArea(value);
          setPage(1);
        }}
        onClear={clearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      <UsuariosTable
        rows={paginated}
        onToggleSort={() =>
          setSortDirection((current) => (current === "asc" ? "desc" : "asc"))
        }
      />

      <UsuariosPagination
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
