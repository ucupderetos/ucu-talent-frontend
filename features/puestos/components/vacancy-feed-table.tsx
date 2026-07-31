"use client";

// Tabla de la vista en lista del feed del alumno — misma información que
// VacancyFeedCard, en formato tabla en vez de grilla de cards. Ver el toggle
// de vista en vacancy-feed-view.tsx. Mismo patrón que VacancyTable (empresa,
// "Mis ofertas"): puramente de presentación, recibe las filas ya resueltas.

import Link from "next/link";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CONTRACT_TYPE_LABELS } from "@/lib/contract-types";
import { DEPARTMENT_LABELS } from "@/lib/departments";
import { formatDate } from "@/lib/format-date";
import { MODALITY_LABELS } from "@/lib/modality";
import type { FeedVacancyRow } from "@/features/puestos/types";

export function VacancyFeedTable({ rows }: { rows: FeedVacancyRow[] }) {
  return (
    <div className="overflow-hidden rounded-xl border">
      <Table>
        {/* Header en azul secundario (`docs/agents/design-system.md`, "Colores") — mismas clases
            escritas literal, mismo criterio que el resto de los usos de
            bg-secondary-blue. */}
        <TableHeader className="bg-secondary-blue [&_th]:text-secondary-blue-foreground">
          <TableRow className="hover:bg-secondary-blue">
            <TableHead>Vacante</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead>Área</TableHead>
            <TableHead>Ubicación</TableHead>
            <TableHead>Modalidad</TableHead>
            <TableHead>Tipo de trabajo</TableHead>
            <TableHead>Publicado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((vacancy) => (
            <TableRow key={vacancy.vacancyId}>
              <TableCell className="max-w-56 whitespace-normal">
                <Link
                  href={`/feed/${vacancy.vacancyId}`}
                  className="rounded-sm font-medium outline-none hover:underline focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {vacancy.name}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground">{vacancy.companyName}</TableCell>
              <TableCell>
                {vacancy.areaName}
                {vacancy.parentAreaName && (
                  <p className="text-xs text-muted-foreground">{vacancy.parentAreaName}</p>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {DEPARTMENT_LABELS[vacancy.location]}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {MODALITY_LABELS[vacancy.modality]}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {CONTRACT_TYPE_LABELS[vacancy.contractType] ?? vacancy.contractType}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(vacancy.publicationDate)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
