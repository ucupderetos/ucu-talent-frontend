"use client";

import Link from "next/link";

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
import { VACANCY_MODALITY_LABEL } from "@/features/moderacion/components/vacancies/vacancy-labels";
import { VacancyActionsMenu } from "@/features/moderacion/components/vacancies/vacancy-actions-menu";
import { VacancyStatusBadge } from "@/components/vacancies/vacancy-status-badge";
import type { AdminVacancyRow } from "@/features/moderacion/types";

export function VacanciesTable({ vacancies }: { vacancies: AdminVacancyRow[] }) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="px-5">Oferta</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead>Modalidad</TableHead>
            <TableHead>Publicación</TableHead>
            <TableHead>Postulaciones</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="pr-5 text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {vacancies.map((vacancy) => {
            const isNew = wasPublishedWithinLastDay(vacancy.publicationDate);

            return (
              <TableRow
                key={vacancy.vacancyId}
                className={isNew ? "bg-accent/50" : undefined}
              >
                <TableCell className="px-5 py-4">
                  <div className="max-w-72">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium">{vacancy.name}</p>
                      {isNew && (
                        <Badge className="shrink-0 bg-secondary-blue text-secondary-blue-foreground">
                          Nueva
                        </Badge>
                      )}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {vacancy.contractType} · {formatDepartment(vacancy.location)}
                    </p>
                  </div>
                </TableCell>

                <TableCell>
                  <Link
                    href={`/moderacion/empresas/${vacancy.companyId}`}
                    aria-label={`Ver información de ${vacancy.companyName}`}
                    className="flex items-center gap-3 rounded-sm outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Avatar className="size-9 rounded-lg">
                      <AvatarFallback className="rounded-lg bg-chart-1/15 text-chart-1">
                        {vacancy.companyInitials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{vacancy.companyName}</span>
                  </Link>
                </TableCell>

                <TableCell>{VACANCY_MODALITY_LABEL[vacancy.modality]}</TableCell>
                <TableCell>{formatPublicationDate(vacancy.publicationDate)}</TableCell>
                <TableCell>{vacancy.applicationCount.toLocaleString("es-UY")}</TableCell>
                <TableCell>
                  <VacancyStatusBadge status={vacancy.status} />
                </TableCell>
                <TableCell className="pr-5 text-right">
                  <VacancyActionsMenu vacancy={vacancy} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function formatPublicationDate(iso: string | null): string {
  return iso ? new Date(iso).toLocaleDateString("es-UY") : "Sin publicar";
}

/** RF-MOD-01: el Admin distingue las vacantes publicadas en las últimas 24 h. */
function wasPublishedWithinLastDay(iso: string | null): boolean {
  if (!iso) return false;

  const elapsed = Date.now() - new Date(iso).getTime();
  return elapsed >= 0 && elapsed <= 24 * 60 * 60 * 1000;
}

function formatDepartment(department: string): string {
  return department
    .toLocaleLowerCase("es")
    .split("_")
    .map((word) => word.charAt(0).toLocaleUpperCase("es") + word.slice(1))
    .join(" ");
}
