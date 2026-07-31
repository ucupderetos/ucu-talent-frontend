"use client";

// Tabla de "Empresas": recibe las filas ya resueltas por el hook. La identidad
// enlaza al detalle y el menú reutiliza las acciones administrativas de esa
// pantalla.
//
// El estado se pinta con `CompanyStatusBadge`, no con un mapa propio: antes
// había dos `statusConfig` para el mismo enum, con estilos distintos.

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
import { CompanyStatusBadge } from "@/features/moderacion/components/companies/company-status-badge";
import { CompanyModerationActions } from "@/features/moderacion/components/companies/company-moderation-actions";
import { parseCalendarDate } from "@/features/moderacion/date-utils";
import { useSignedProfileImageUrl } from "@/hooks/use-profile-image";
import type { AdminCompanyRow } from "@/features/moderacion/types";

function formatDate(iso: string | null): string {
  if (!iso) return "—";

  const date = parseCalendarDate(iso);
  return date ? date.toLocaleDateString("es-UY") : "—";
}

// La key de storage ya viene en la fila (`AdminCompanyRow.profileImage`), así
// que solo falta canjearla por la URL firmada. Mismo criterio que
// `StudentAvatar` en `students-table.tsx`: con `useProfileImage(id)` cada fila
// dispararía además un `GET /user/{id}` para releer esa misma key — el N+1 que
// A-24 (`docs/agents/open-questions.md`) decidió no pagar en pantallas de lista.
//
// El `rounded-lg` va explícito en la imagen: `AvatarImage` trae `rounded-full`
// propio, y el avatar de empresa es cuadrado (es un logo, no una cara).
function CompanyAvatar({ company }: { company: AdminCompanyRow }) {
  const { imageUrl } = useSignedProfileImageUrl(company.profileImage);

  return (
    <Avatar className="size-10 rounded-lg after:rounded-lg">
      {imageUrl && <AvatarImage className="rounded-lg" src={imageUrl} alt="" />}
      <AvatarFallback className="rounded-lg bg-chart-1/15 text-chart-1">
        {company.initials}
      </AvatarFallback>
    </Avatar>
  );
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
            <TableHead className="pl-4 pr-5">Acciones</TableHead>
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
                  <CompanyAvatar company={company} />

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
              <TableCell className="pr-5">
                <CompanyModerationActions company={company} includeDetailLink />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
