"use client";

// Tabla de "Postulaciones": recibe las filas ya resueltas por el hook. Las
// identidades y el menú de acciones navegan a los detalles administrativos
// existentes; el Admin no modifica manualmente el estado de una postulación.

import Link from "next/link";
import {
  BriefcaseBusinessIcon,
  Building2Icon,
  MoreVerticalIcon,
  UserRoundIcon,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ApplicationStatusBadge } from "@/features/moderacion/components/applications/application-status-badge";
import { avatarColorFor, initialsFrom } from "@/lib/avatar";
import type { AdminApplicationRow } from "@/features/moderacion/types";

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
                <Link
                  href={`/moderacion/estudiantes/${row.studentProfileId}`}
                  aria-label={`Ver perfil de ${row.studentName} ${row.studentSurname}`}
                  className="group flex items-center gap-3 rounded-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <Avatar>
                    <AvatarFallback className={avatarColorFor(row.studentProfileId)}>
                      {initialsFrom(row.studentName, row.studentSurname)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium group-hover:underline group-focus-visible:underline">
                      {row.studentName} {row.studentSurname}
                    </p>
                    <p className="text-xs text-muted-foreground">{row.studentEmail}</p>
                  </div>
                </Link>
              </TableCell>
              <TableCell>
                <Link
                  href={`/moderacion/ofertas/${row.vacancyId}`}
                  aria-label={`Ver oferta ${row.vacancyName}`}
                  className="group block rounded-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <p className="font-medium group-hover:underline group-focus-visible:underline">
                    {row.vacancyName}
                  </p>
                  <p className="text-xs text-muted-foreground">ID: {row.vacancyId}</p>
                </Link>
              </TableCell>
              <TableCell>
                {row.companyId ? (
                  <Link
                    href={`/moderacion/empresas/${row.companyId}`}
                    aria-label={`Ver empresa ${row.companyName}`}
                    className="group flex items-center gap-2 rounded-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <span
                      className={`flex size-8 shrink-0 items-center justify-center rounded-md text-xs font-semibold ${avatarColorFor(row.companyId)}`}
                    >
                      {companyInitials(row.companyName)}
                    </span>
                    <span className="whitespace-nowrap font-medium group-hover:underline group-focus-visible:underline">
                      {row.companyName}
                    </span>
                  </Link>
                ) : (
                  <span className="whitespace-nowrap text-muted-foreground">
                    {row.companyName}
                  </span>
                )}
              </TableCell>
              <TableCell>{formatDate(row.appliedAt)}</TableCell>
              <TableCell>
                <ApplicationStatusBadge status={row.status} />
              </TableCell>
              <TableCell className="text-right">
                <ApplicationActionsMenu application={row} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function ApplicationActionsMenu({ application }: { application: AdminApplicationRow }) {
  const studentName = `${application.studentName} ${application.studentSurname}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Abrir acciones de la postulación de ${studentName}`}
        >
          <MoreVerticalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <Link href={`/moderacion/estudiantes/${application.studentProfileId}`}>
            <UserRoundIcon />
            Ver perfil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/moderacion/ofertas/${application.vacancyId}`}>
            <BriefcaseBusinessIcon />
            Ver oferta
          </Link>
        </DropdownMenuItem>
        {application.companyId && (
          <DropdownMenuItem asChild>
            <Link href={`/moderacion/empresas/${application.companyId}`}>
              <Building2Icon />
              Ver empresa
            </Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
