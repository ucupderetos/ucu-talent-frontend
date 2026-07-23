"use client";

// arma toda la pantalla de validaciones: junta los datos de los hooks con
// el estado de los filtros, el orden y la pestaña activa (empresas o
// estudiantes), y se lo pasa a los componentes. esto es lo unico que
// renderiza la page.

import { useMemo, useState } from "react";
import { DownloadIcon, SearchIcon } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ValidacionesFilters } from "@/features/moderacion/components/validaciones/validaciones-filters";
import { EmpresasPendientesTable } from "@/features/moderacion/components/validaciones/empresas-pendientes-table";
import { AlumnosPendientesTable } from "@/features/moderacion/components/validaciones/alumnos-pendientes-table";
import { useValidaciones } from "@/features/moderacion/hooks/use-validaciones";
import { useAlumnosPendientes } from "@/features/moderacion/hooks/use-alumnos-pendientes";

type Pestaña = "empresas" | "estudiantes";

export function ValidacionesView() {
  const [tab, setTab] = useState<Pestaña>("empresas");

  const empresasData = useValidaciones();
  const alumnosData = useAlumnosPendientes();

  const isLoading = empresasData.isLoading || alumnosData.isLoading;
  const error = empresasData.error || alumnosData.error;

  if (isLoading) return <Skeleton className="h-96 w-full" />;
  if (error) return <p className="text-sm text-destructive">No pudimos cargar las validaciones.</p>;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Validaciones"
        description="Revisá y aprobá las solicitudes de empresas y estudiantes antes de que operen en la plataforma."
        actions={
          <Button variant="outline">
            <DownloadIcon data-icon="inline-start" />
            Exportar
          </Button>
        }
      />

      <Tabs value={tab} onValueChange={(value) => setTab(value as Pestaña)}>
        <TabsList>
          <TabsTrigger value="empresas">
            Empresas ({empresasData.empresas.length})
          </TabsTrigger>
          <TabsTrigger value="estudiantes">
            Estudiantes ({alumnosData.alumnos.length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {tab === "empresas" && <EmpresasTab empresas={empresasData.empresas} />}
      {tab === "estudiantes" && <EstudiantesTab alumnos={alumnosData.alumnos} />}
    </div>
  );
}

function EmpresasTab({ empresas }: { empresas: ReturnType<typeof useValidaciones>["empresas"] }) {
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

  return (
    <>
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
    </>
  );
}

function EstudiantesTab({
  alumnos,
}: {
  alumnos: ReturnType<typeof useAlumnosPendientes>["alumnos"];
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return alumnos.filter((a) => {
      return (
        query === "" ||
        `${a.name} ${a.surname}`.toLowerCase().includes(query) ||
        a.email.toLowerCase().includes(query) ||
        a.documentNumber.includes(query)
      );
    });
  }, [alumnos, search]);

  return (
    <>
      <div className="relative max-w-xs">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por nombre, email o cédula..."
          className="pl-8"
        />
      </div>

      <AlumnosPendientesTable rows={filtered} />
    </>
  );
}
