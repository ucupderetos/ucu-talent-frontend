"use client";

// Tabla de "Mis ofertas". Puramente de presentación: recibe las filas ya
// filtradas/ordenadas/paginadas por el hook y no sabe nada de fixtures ni de
// TanStack Query.

import Link from "next/link";
import { EyeIcon, MoreHorizontalIcon, PauseIcon, PlayIcon, XCircleIcon } from "lucide-react";
import { toast } from "sonner";

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
import { Button } from "@/components/ui/button";
import {
  VACANCY_STATUS_DESCRIPTION,
  VacancyStatusBadge,
} from "@/features/puestos/components/vacancy-status-badge";
import type { CompanyVacancyRow } from "@/features/puestos/types";
import type { Modality } from "@/types";

const MODALITY_LABEL: Record<Modality, string> = {
  onsite: "Presencial",
  remote: "Remota",
  hybrid: "Híbrida",
};

const dateFormatter = new Intl.DateTimeFormat("es-UY", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function formatDate(iso: string | null): string {
  return iso ? dateFormatter.format(new Date(iso)) : "—";
}

/** Las mutaciones de estado quedan pendientes del contrato de la API — ver
 *  features/puestos/hooks/use-company-vacancies.ts. Por ahora solo avisan. */
function notImplemented(action: string) {
  toast.info(`"${action}" todavía no está disponible: falta el contrato de la API.`);
}

export function VacancyTable({ rows }: { rows: CompanyVacancyRow[] }) {
  return (
    <div className="overflow-hidden rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Oferta</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Postulantes</TableHead>
            <TableHead>Fecha de publicación</TableHead>
            <TableHead className="w-10">
              <span className="sr-only">Acciones</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((vacancy) => (
            <TableRow key={vacancy.id}>
              <TableCell className="max-w-64 whitespace-normal">
                <Link
                  href={`/puestos/${vacancy.id}/postulantes`}
                  className="font-medium hover:underline"
                >
                  {vacancy.name}
                </Link>
                <p className="text-sm text-muted-foreground">
                  {vacancy.areaName} · {vacancy.location} · {MODALITY_LABEL[vacancy.modality]}
                </p>
              </TableCell>
              <TableCell>
                <VacancyStatusBadge status={vacancy.status} />
                <p className="mt-1 text-xs text-muted-foreground">
                  {VACANCY_STATUS_DESCRIPTION[vacancy.status]}
                </p>
              </TableCell>
              <TableCell>
                <span className="font-medium">{vacancy.applicantsCount}</span>
                {vacancy.newApplicantsThisWeek > 0 && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">
                    +{vacancy.newApplicantsThisWeek} esta semana
                  </p>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(vacancy.publishedAt)}
              </TableCell>
              <TableCell>
                <VacancyRowActions vacancy={vacancy} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function VacancyRowActions({ vacancy }: { vacancy: CompanyVacancyRow }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Acciones de ${vacancy.name}`}>
          <MoreHorizontalIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/puestos/${vacancy.id}/postulantes`}>
            <EyeIcon />
            Ver postulantes
          </Link>
        </DropdownMenuItem>

        {vacancy.status === "published" && (
          <DropdownMenuItem onSelect={() => notImplemented("Pausar oferta")}>
            <PauseIcon />
            Pausar
          </DropdownMenuItem>
        )}

        {vacancy.status === "paused" && (
          <DropdownMenuItem onSelect={() => notImplemented("Publicar oferta")}>
            <PlayIcon />
            Volver a publicar
          </DropdownMenuItem>
        )}

        {(vacancy.status === "published" || vacancy.status === "paused") && (
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => notImplemented("Cerrar oferta")}
          >
            <XCircleIcon />
            Cerrar
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
