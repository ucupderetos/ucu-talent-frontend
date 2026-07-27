"use client";

// Tabla de ofertas más recientes del dashboard.
//
// La fila linkea al listado de Ofertas y no a un detalle por oferta: esa
// pantalla no existe todavía.

import Link from "next/link";

import { VacancyStatusBadge } from "@/components/vacancies/vacancy-status-badge";
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
import type { RecentVacancy } from "@/features/moderacion/types";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-UY");
}

export function RecentVacanciesTable({ vacancies }: { vacancies: RecentVacancy[] }) {
  return (
    <Card className="flex flex-col overflow-hidden gap-0 py-0">
      <CardHeader className="gap-0 px-5 py-3">
        <CardTitle>Ofertas más recientes</CardTitle>
      </CardHeader>

      <Separator />

      <CardContent className="flex min-h-0 flex-1 flex-col p-0">
        {vacancies.length === 0 ? (
          <div className="p-5">
            <EmptyState
              title="Todavía no hay ofertas"
              description="Las ofertas publicadas van a aparecer acá."
            />
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto [&_[data-slot=table-container]]:overflow-x-hidden">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-card">
                <TableRow>
                  <TableHead className="h-9 px-5">Puesto</TableHead>
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
                      <VacancyStatusBadge status={vacancy.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <CardFooter className="mt-auto px-5 py-3">
        <Button asChild variant="link" className="h-auto p-0 text-primary">
          <Link href="/moderacion/ofertas">Ver todas las ofertas</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
