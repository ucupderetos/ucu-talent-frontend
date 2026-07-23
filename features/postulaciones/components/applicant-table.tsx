"use client";

// Tabla de "Postulantes". Puramente de presentación: recibe las filas ya
// filtradas/ordenadas/paginadas por el hook y no sabe nada de fixtures ni de
// TanStack Query. Al hacer click en una fila, navega al detalle
// (/postulantes/[id]) — página propia, no panel lateral ni modal.

import Link from "next/link";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ApplicantStatusBadge } from "@/features/postulaciones/components/applicant-status-badge";
import type { ApplicantRow } from "@/features/postulaciones/types";

const dateFormatter = new Intl.DateTimeFormat("es-UY", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso));
}

function initials(name: string, surname: string): string {
  return `${name.charAt(0)}${surname.charAt(0)}`.toUpperCase();
}

export function ApplicantTable({ rows }: { rows: ApplicantRow[] }) {
  return (
    <div className="overflow-hidden rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Postulante</TableHead>
            <TableHead>Oferta</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fecha de postulación</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.application.vacancyApplicationId}>
              <TableCell>
                <Link
                  href={`/postulantes/${row.application.vacancyApplicationId}`}
                  className="flex items-center gap-3 rounded-xs"
                >
                  <Avatar>
                    <AvatarFallback>{initials(row.profile.name, row.profile.surname)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-medium hover:underline">
                      {row.profile.name} {row.profile.surname}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">{row.user.email}</p>
                  </div>
                </Link>
              </TableCell>
              <TableCell className="max-w-48 whitespace-normal text-muted-foreground">
                {row.vacancyName}
              </TableCell>
              <TableCell>
                <ApplicantStatusBadge status={row.application.status} />
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(row.application.appliedAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
