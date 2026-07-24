"use client";

// Tabla de "Empresas": de presentación, recibe las filas ya resueltas por el
// hook. La fila entera linkea al detalle.
//
// El estado se pinta con `CompanyStatusBadge`, no con un mapa propio: antes
// había dos `statusConfig` para el mismo enum, con estilos distintos.

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
import { CompanyStatusBadge } from "@/features/moderacion/components/companies/company-status-badge";
import type { AdminCompanyRow } from "@/features/moderacion/types";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-UY");
}

export function CompaniesTable({ companies }: { companies: AdminCompanyRow[] }) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="px-5">Empresa</TableHead>
            <TableHead>Rubro / Industria</TableHead>
            <TableHead>Ubicación</TableHead>
            <TableHead>Fecha de registro</TableHead>
            <TableHead>Estado</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {companies.map((company) => (
            <TableRow key={company.id} className="transition-colors hover:bg-muted/30">
              <TableCell className="p-0">
                <Link
                  href={`/moderacion/empresas/${company.id}`}
                  aria-label={`Ver información de ${company.name}`}
                  className="flex items-center gap-3 px-5 py-4 outline-none transition-colors hover:bg-muted/50 focus-visible:bg-muted/50"
                >
                  <Avatar className="size-10 rounded-lg">
                    <AvatarFallback className="rounded-lg bg-chart-1/15 text-chart-1">
                      {company.initials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0">
                    <p className="truncate font-medium">{company.name}</p>
                    <p className="truncate text-sm text-muted-foreground">{company.email}</p>
                  </div>
                </Link>
              </TableCell>

              <TableCell>{company.industry}</TableCell>
              <TableCell>{company.location}</TableCell>
              <TableCell>{formatDate(company.registeredAt)}</TableCell>

              <TableCell>
                <CompanyStatusBadge status={company.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
