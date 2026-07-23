import Link from "next/link";

import type { AccountStatus } from "@/types";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AdminCompanyRow } from "@/features/moderacion/types";

type CompaniesTableProps = {
  companies: AdminCompanyRow[];
};

const statusConfig = {
  APROBADO: {
    label: "Aprobada",
    className: "bg-emerald-50 text-emerald-700",
  },
  PENDIENTE: {
    label: "Pendiente",
    className: "bg-amber-50 text-amber-700",
  },
  RECHAZADO: {
    label: "Rechazada",
    className: "bg-destructive/10 text-destructive",
  },
} satisfies Record<
  AccountStatus,
  {
    label: string;
    className: string;
  }
>;

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("es-UY").format(new Date(date));
}

export function CompaniesTable({ companies }: CompaniesTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl bg-card">
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
          {companies.map((company) => {
            const status = statusConfig[company.status];

            return (
              <TableRow
                key={company.id}
                className="transition-colors hover:bg-muted/30"
              >
                <TableCell className="p-0">
                  <Link
                    href={`/moderacion/empresas/${company.id}`}
                    aria-label={`Ver información de ${company.name}`}
                    className="flex items-center gap-3 px-5 py-4 outline-none transition-colors hover:bg-muted/50 focus-visible:bg-muted/50"
                  >
                    <Avatar className="size-10 rounded-lg">
                      <AvatarFallback className="rounded-lg bg-blue-50 text-blue-700">
                        {company.initials}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                      <p className="truncate font-medium">{company.name}</p>

                      <p className="truncate text-sm text-muted-foreground">
                        {company.email}
                      </p>
                    </div>
                  </Link>
                </TableCell>

                <TableCell>{company.industry}</TableCell>

                <TableCell>{company.location}</TableCell>

                <TableCell>{formatDate(company.registeredAt)}</TableCell>

                <TableCell>
                  <Badge variant="secondary" className={status.className}>
                    {status.label}
                  </Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}