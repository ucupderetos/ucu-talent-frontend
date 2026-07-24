"use client";

// Tabla de "Postulaciones": de presentación, recibe las filas ya resueltas
// por el hook. El botón de acciones todavía no hace nada — no hay endpoint
// (ver aviso en features/moderacion/types.ts). Misma columna "Acciones" que
// `students-table.tsx`, para que las dos tablas del admin se lean igual.

import { MoreVerticalIcon } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ApplicationStatusBadge } from "@/features/moderacion/components/applications/application-status-badge";
import type { AdminApplicationRow } from "@/features/moderacion/types";

// Colores semánticos (tokens `--chart-*` de globals.css), no la paleta cruda
// de Tailwind. El color de cada avatar/logo sale de un hash del id — es
// estable sin importar en qué página caiga la fila (no rota por índice).
const COLOR_CLASSES = [
  "bg-chart-1/15 text-chart-1",
  "bg-chart-2/15 text-chart-2",
  "bg-chart-3/15 text-chart-3",
  "bg-chart-4/15 text-chart-4",
  "bg-chart-5/15 text-chart-5",
];

function colorFor(id: string): string {
  let hash = 0;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) % COLOR_CLASSES.length;
  return COLOR_CLASSES[hash];
}

/** `?? ""` porque con datos reales un nombre o apellido puede venir vacío, y
 *  `name[0]` sería `undefined` — el avatar diría "undefinedU". */
function initials(name: string, surname: string): string {
  return `${name[0] ?? ""}${surname[0] ?? ""}`.toUpperCase();
}

/** Fallback a la primera letra: una razón social sin ninguna palabra en
 *  mayúscula ("datalab") dejaría el cuadrito de color vacío. */
function companyInitials(name: string): string {
  const fromCapitals = name
    .split(" ")
    .filter((word) => /^[A-ZÁÉÍÓÚ]/.test(word))
    .slice(0, 2)
    .map((word) => word[0])
    .join("");

  return (fromCapitals || name.trim()[0] || "").toUpperCase();
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-UY");
}

export function ApplicationsTable({ rows }: { rows: AdminApplicationRow[] }) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Postulante</TableHead>
            <TableHead>Oferta</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead>Fecha de postulación</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.vacancyApplicationId}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className={colorFor(row.studentProfileId)}>
                      {initials(row.studentName, row.studentSurname)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {row.studentName} {row.studentSurname}
                    </p>
                    <p className="text-xs text-muted-foreground">{row.studentEmail}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <p>{row.vacancyName}</p>
                <p className="text-xs text-muted-foreground">ID: {row.vacancyId}</p>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {row.companyId && (
                    <span
                      className={`flex size-8 shrink-0 items-center justify-center rounded-md text-xs font-semibold ${colorFor(row.companyId)}`}
                    >
                      {companyInitials(row.companyName)}
                    </span>
                  )}
                  <span className="whitespace-nowrap">{row.companyName}</span>
                </div>
              </TableCell>
              <TableCell>{formatDate(row.appliedAt)}</TableCell>
              <TableCell>
                <ApplicationStatusBadge status={row.status} />
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" aria-label="Acciones">
                  <MoreVerticalIcon />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
