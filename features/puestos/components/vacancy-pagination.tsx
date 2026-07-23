"use client";

// Footer de paginación de "Mis ofertas": rango mostrado + tamaño de página +
// controles de página. Controlado desde afuera, sin estado propio.

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PER_PAGE_OPTIONS = [5, 10, 20];

export function VacancyPagination({
  page,
  perPage,
  total,
  onPageChange,
  onPerPageChange,
}: {
  page: number;
  perPage: number;
  total: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  return (
    <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Mostrando {from} a {to} de {total} ofertas
      </p>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          Mostrar
          <Select
            value={String(perPage)}
            onValueChange={(value) => onPerPageChange(Number(value))}
          >
            <SelectTrigger
              size="sm"
              aria-label="Resultados por página"
              className="focus-visible:border-sidebar focus-visible:ring-sidebar/50"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PER_PAGE_OPTIONS.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          por página
        </div>

        <Pagination className="mx-0 w-fit">
          <PaginationContent>
            <PaginationItem>
              <Button
                variant="ghost"
                size="icon"
                // Foco por teclado en azul (--sidebar), no el verde agua
                // (--ring) que usa el resto del sitio — para combinar con
                // "Crear nueva oferta" / "Aplicar filtros" en esta misma vista.
                className="focus-visible:border-sidebar focus-visible:ring-sidebar/50"
                aria-label="Página anterior"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
              >
                <span aria-hidden>‹</span>
              </Button>
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
              <PaginationItem key={pageNumber}>
                <PaginationLink
                  href="#"
                  isActive={pageNumber === page}
                  className={cn(
                    "focus-visible:border-sidebar focus-visible:ring-sidebar/50",
                    pageNumber === page &&
                      "border-transparent bg-sidebar text-sidebar-foreground hover:bg-sidebar-accent",
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange(pageNumber);
                  }}
                >
                  {pageNumber}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <Button
                variant="ghost"
                size="icon"
                className="focus-visible:border-sidebar focus-visible:ring-sidebar/50"
                aria-label="Página siguiente"
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
              >
                <span aria-hidden>›</span>
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
