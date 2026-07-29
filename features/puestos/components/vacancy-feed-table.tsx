"use client";

// Tabla de la vista en lista del feed del alumno — misma información que
// VacancyFeedCard, en formato tabla en vez de grilla de cards. Ver el toggle
// de vista en vacancy-feed-view.tsx. Mismo patrón que VacancyTable (empresa,
// "Mis ofertas"): puramente de presentación, recibe las filas ya resueltas.

import Link from "next/link";
import { BookmarkIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DEPARTMENT_LABEL, dateFormatter } from "@/features/puestos/components/vacancy-feed-card";
import { CONTRACT_TYPE_LABELS } from "@/lib/contract-types";
import type { FeedVacancyRow } from "@/features/puestos/types";
import type { Modality } from "@/types";

const MODALITY_LABEL: Record<Modality, string> = {
  PRESENCIAL: "Presencial",
  REMOTO: "Remota",
  HIBRIDO: "Híbrida",
};

export function VacancyFeedTable({ rows }: { rows: FeedVacancyRow[] }) {
  return (
    <div className="overflow-hidden rounded-xl border">
      <Table>
        {/* Header en azul secundario (AGENTS.md, "Colores") — mismas clases
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
            <TableHead className="w-10">
              <span className="sr-only">Guardar</span>
            </TableHead>
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
                {DEPARTMENT_LABEL[vacancy.location]}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {MODALITY_LABEL[vacancy.modality]}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {CONTRACT_TYPE_LABELS[vacancy.contractType] ?? vacancy.contractType}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {dateFormatter.format(new Date(vacancy.publicationDate))}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-muted-foreground"
                  aria-label="Guardar vacante"
                  onClick={() => toast.info("Guardar vacantes todavía no está disponible.")}
                >
                  <BookmarkIcon className="size-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
