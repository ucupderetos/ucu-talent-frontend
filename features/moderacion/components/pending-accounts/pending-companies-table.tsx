"use client";

// tabla de empresas pendientes. recibe las filas ya filtradas. las acciones
// (Aprobar/Rechazar, con confirmación y motivo) las maneja ReviewActions.

import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ReviewActions } from "@/features/moderacion/components/pending-accounts/review-actions";
import { useSignedProfileImageUrl } from "@/hooks/use-profile-image";
import { avatarColorFor } from "@/lib/avatar";
import type { PendingCompanyRow } from "@/features/moderacion/types";

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

// La key de la foto ya viene en la fila (sale del `User`, no de `Company`), así
// que acá solo se canjea por la URL firmada — sin `GET /user/{id}` por empresa.
// Ver el aviso en `PendingCompanyRow.profileImage`.
//
// Es un `Avatar` y no el `<span>` que había antes porque hace falta el fallback
// automático de Radix: si la URL firmada falla al cargar, vuelve solo a las
// iniciales. Se mantiene cuadrado (`rounded-md`) — es un logo, no una cara.
function PendingCompanyAvatar({ company }: { company: PendingCompanyRow }) {
  const { imageUrl } = useSignedProfileImageUrl(company.profileImage);

  return (
    <Avatar className="size-9 rounded-md after:rounded-md">
      {imageUrl && <AvatarImage className="rounded-md" src={imageUrl} alt="" />}
      <AvatarFallback
        className={`rounded-md text-xs font-semibold ${avatarColorFor(company.companyId)}`}
      >
        {company.hasProfile ? companyInitials(company.name) : "?"}
      </AvatarFallback>
    </Avatar>
  );
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
                  <PendingCompanyAvatar company={company} />
                  <div>
                    <p className="font-medium group-hover:underline group-focus-visible:underline">
                      {company.hasProfile ? company.name : company.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {company.hasProfile ? company.industry : "Perfil incompleto"}
                    </p>
                  </div>
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground">{company.email}</TableCell>
              <TableCell>{formatDate(company.registeredAt)}</TableCell>
              <TableCell className="text-right">
                <ReviewActions
                  userId={company.companyId}
                  displayName={company.hasProfile ? company.name : company.email}
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
