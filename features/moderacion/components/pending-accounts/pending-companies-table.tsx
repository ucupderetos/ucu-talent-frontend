"use client";

// tabla de empresas pendientes. recibe las filas ya filtradas. las acciones
// (Aprobar/Rechazar, con confirmación y motivo) las maneja ReviewActions.

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ReviewActions } from "@/features/moderacion/components/pending-accounts/review-actions";
import type { PendingCompanyRow } from "@/features/moderacion/types";

// colores semanticos (tokens --chart-* de globals.css), no la paleta cruda.
// el color sale de un hash del id, asi no cambia segun la pagina en la que caiga.
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

function companyInitials(name: string): string {
  return name
    .split(" ")
    .filter((word) => /^[A-ZÁÉÍÓÚ]/.test(word))
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function formatDate(iso: string): string {
  return iso ? new Date(iso).toLocaleDateString("es-UY") : "—";
}

export function PendingCompaniesTable({ rows }: { rows: PendingCompanyRow[] }) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Empresa</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Fecha de solicitud</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((company) => (
            <TableRow key={company.companyId}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <span
                    className={`flex size-9 shrink-0 items-center justify-center rounded-md text-xs font-semibold ${colorFor(company.companyId)}`}
                  >
                    {companyInitials(company.name)}
                  </span>
                  <div>
                    <p className="font-medium">{company.name}</p>
                    <p className="text-xs text-muted-foreground">{company.industry}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">{company.email}</TableCell>
              <TableCell>{formatDate(company.registeredAt)}</TableCell>
              <TableCell className="text-right">
                <ReviewActions
                  userId={company.companyId}
                  displayName={company.name}
                  accountType="company"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
