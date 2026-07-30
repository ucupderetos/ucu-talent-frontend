"use client";

// tabla de empresas pendientes. recibe las filas ya filtradas. las acciones
// (Aprobar/Rechazar, con confirmación y motivo) las maneja ReviewActions.

import Link from "next/link";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ReviewActions } from "@/features/moderacion/components/pending-accounts/review-actions";
import { avatarColorFor, companyInitials } from "@/features/moderacion/avatar-utils";
import type { PendingCompanyRow } from "@/features/moderacion/types";

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
                <Link
                  href={`/moderacion/empresas/${company.companyId}`}
                  aria-label={`Ver información de ${company.name}`}
                  className="group flex items-center gap-3 rounded-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <span
                    className={`flex size-9 shrink-0 items-center justify-center rounded-md text-xs font-semibold ${avatarColorFor(company.companyId)}`}
                  >
                    {companyInitials(company.name)}
                  </span>
                  <div>
                    <p className="font-medium group-hover:underline group-focus-visible:underline">
                      {company.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{company.industry}</p>
                  </div>
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground">{company.email}</TableCell>
              <TableCell>{formatDate(company.registeredAt)}</TableCell>
              <TableCell className="text-right">
                <ReviewActions
                  userId={company.companyId}
                  displayName={company.name}
                  accountType="EMPRESA"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
