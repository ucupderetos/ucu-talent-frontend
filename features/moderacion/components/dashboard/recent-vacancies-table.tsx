"use client";

// Tabla de ofertas más recientes del dashboard.
//
// La fila linkea al listado de Ofertas y no a un detalle por oferta: esa
// pantalla no existe todavía.

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/layout/empty-state";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { RecentVacancy } from "@/features/moderacion/types";
import type { VacancyStatus } from "@/types";

// Badge con punto de color, igual que `vacancy-status-badge.tsx` y
// `application-status-badge.tsx` — no una pastilla con fondo de color propio.
//
// Las etiquetas son las mismas que usa `features/puestos/components/
// vacancy-status-badge.tsx` para el mismo enum: se repiten acá y no se importan
// porque moderacion no importa de otro dominio (AGENTS.md). Si divergen, es que
// hay que subir ese badge a `components/`.
const STATUS_LABEL: Record<VacancyStatus, string> = {
  PENDIENTE: "Activa",
  FINALIZADO: "Cerrada",
};

const STATUS_DOT_CLASS: Record<VacancyStatus, string> = {
  PENDIENTE: "bg-success",
  FINALIZADO: "bg-muted-foreground",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-UY");
}

export function RecentVacanciesTable({ vacancies }: { vacancies: RecentVacancy[] }) {
  return (
    <Card className="flex h-full flex-col overflow-hidden py-0">
      <CardHeader className="px-5 py-3">
        <CardTitle>Ofertas más recientes</CardTitle>
      </CardHeader>

      <Separator />

      <CardContent className="min-h-0 flex-1 p-0">
        {vacancies.length === 0 ? (
          <div className="p-5">
            <EmptyState
              title="Todavía no hay ofertas"
              description="Las ofertas publicadas van a aparecer acá."
            />
          </div>
        ) : (
          <div className="max-h-[220px] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-card">
                <TableRow>
                  <TableHead className="px-5">Puesto</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Publicación</TableHead>
                  <TableHead>Postulaciones</TableHead>
                  <TableHead className="pr-5">Estado</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {vacancies.map((vacancy) => (
                  <TableRow key={vacancy.id}>
                    <TableCell className="px-5 font-medium">
                      <Link href="/moderacion/ofertas" className="hover:text-primary hover:underline">
                        {vacancy.position}
                      </Link>
                    </TableCell>

                    <TableCell className="text-muted-foreground">{vacancy.company}</TableCell>

                    <TableCell className="text-muted-foreground">
                      {formatDate(vacancy.publishedAt)}
                    </TableCell>

                    <TableCell className="text-muted-foreground">
                      {vacancy.applications ?? "—"}
                    </TableCell>

                    <TableCell className="pr-5">
                      <Badge variant="outline" className="gap-1.5">
                        <span
                          className={cn(
                            "size-1.5 shrink-0 rounded-full",
                            STATUS_DOT_CLASS[vacancy.status],
                          )}
                          aria-hidden
                        />
                        {STATUS_LABEL[vacancy.status]}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <Separator />

      <CardFooter className="mt-auto px-5 py-3">
        <Button asChild variant="link" className="h-auto p-0 text-primary">
          <Link href="/moderacion/ofertas">Ver todas las ofertas</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
