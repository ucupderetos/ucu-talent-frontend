"use client";

// Footer de paginación genérico: rango mostrado + tamaño de página +
// controles de página. Controlado desde afuera, sin estado propio — lo usa
// cualquier listado paginado del sitio (ofertas, postulantes, moderación…).
// Mismo criterio que `components/filters/`: agnóstico del dominio.

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
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

/**
 * Qué botones de página mostrar: siempre primera y última, la página activa
 * con un vecino de cada lado, y "…" en los huecos. Sin este recorte, un
 * listado con muchas páginas rendería un botón por cada una y desbordaría el
 * footer.
 */
function getPageNumbers(page: number, totalPages: number): (number | "ellipsis")[] {
  const items: (number | "ellipsis")[] = [1];

  const left = Math.max(2, page - 1);
  const right = Math.min(totalPages - 1, page + 1);

  if (left > 2) items.push("ellipsis");
  for (let pageNumber = left; pageNumber <= right; pageNumber++) {
    items.push(pageNumber);
  }
  if (right < totalPages - 1) items.push("ellipsis");

  if (totalPages > 1) items.push(totalPages);

  return items;
}

export function ListPagination({
  page,
  perPage,
  total,
  /** Sustantivo de lo que se está paginando, para el texto "Mostrando X a Y de Z ___". */
  itemLabel,
  onPageChange,
  onPerPageChange,
}: {
  page: number;
  perPage: number;
  total: number;
  itemLabel: string;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  return (
    <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Mostrando {from} a {to} de {total} {itemLabel}
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
                className="focus-visible:border-sidebar focus-visible:ring-sidebar/50"
                aria-label="Página anterior"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
              >
                <span aria-hidden>‹</span>
              </Button>
            </PaginationItem>
            {getPageNumbers(page, totalPages).map((pageNumber, index) =>
              pageNumber === "ellipsis" ? (
                <PaginationItem key={`ellipsis-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
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
              ),
            )}
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
