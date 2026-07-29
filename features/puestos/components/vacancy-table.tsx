"use client";

// Tabla de "Mis ofertas". Puramente de presentación: recibe las filas ya
// filtradas/ordenadas/paginadas por el hook y no sabe nada de fixtures ni de
// TanStack Query.

import Link from "next/link";
import { PencilIcon, UserIcon, XCircleIcon } from "lucide-react";
import { toast } from "sonner";

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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  VACANCY_STATUS_DESCRIPTION,
  VacancyStatusBadge,
} from "@/components/vacancies/vacancy-status-badge";
import type { CompanyVacancyRow } from "@/features/puestos/types";
import type { Modality } from "@/types";

const MODALITY_LABEL: Record<Modality, string> = {
  PRESENCIAL: "Presencial",
  REMOTO: "Remota",
  HIBRIDO: "Híbrida",
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
            <TableHead className="pl-4">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((vacancy) => (
            <TableRow key={vacancy.vacancyId}>
              <TableCell className="max-w-64 whitespace-normal">
                <Link
                  href={`/postulantes?vacancyId=${vacancy.vacancyId}`}
                  // Mismo foco navy que el resto del sitio (`--ring`, ver
                  // "Estados" en AGENTS.md) — un `<Link>` no es un primitivo
                  // de `components/ui/`, así que no trae el ancho de foco
                  // solo (`ring-3`) y hay que ponerlo a mano.
                  className="rounded-sm font-medium outline-none hover:underline focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
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
                  <p className="text-xs text-success">
                    +{vacancy.newApplicantsThisWeek} esta semana
                  </p>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(vacancy.publicationDate)}
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
    <div className="flex items-center gap-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" asChild>
            <Link
              href={`/postulantes?vacancyId=${vacancy.vacancyId}`}
              aria-label={`Ver postulantes de ${vacancy.name}`}
            >
              <UserIcon className="size-4" />
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Ver postulantes</TooltipContent>
      </Tooltip>

      {/* Editar (`PUT /vacancy/{id}`) no se ofrece en dos casos:
          - `FINALIZADO`: estado terminal (AGENTS.md), el backend lo rechaza.
          - con postulaciones: A-06 quedó RESUELTO — el backend da
            `403 "El Puesto ya tiene postulaciones."` si `applicantsCount > 0`
            (ENDPOINTS.md). En vez de dejar completar el form y comerse el 403 al
            guardar, se muestra el botón deshabilitado con el motivo. */}
      {vacancy.status !== "FINALIZADO" &&
        (vacancy.applicantsCount > 0 ? (
          <Tooltip>
            <TooltipTrigger asChild>
              {/* Radix no dispara el tooltip sobre un `Button` deshabilitado (no
                  recibe eventos de puntero); el `span` envolvente sí. */}
              <span tabIndex={0}>
                <Button variant="ghost" size="icon" disabled aria-label={`Editar ${vacancy.name}`}>
                  <PencilIcon className="size-4" />
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>No se puede editar: ya tiene postulaciones</TooltipContent>
          </Tooltip>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" asChild>
                <Link
                  href={`/puestos/${vacancy.vacancyId}/editar`}
                  aria-label={`Editar ${vacancy.name}`}
                >
                  <PencilIcon className="size-4" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Editar oferta</TooltipContent>
          </Tooltip>
        ))}

      {/* La empresa dueña solo puede cerrar, y solo desde `PUBLICADO`
          (RF-PUE-03). Retirar una vacante a `PENDIENTE` es potestad del
          Admin, no de la empresa — ver `VacancyStatus` en types/index.ts. */}
      {vacancy.status === "PUBLICADO" && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive"
              aria-label={`Cerrar ${vacancy.name}`}
              onClick={() => notImplemented("Cerrar oferta")}
            >
              <XCircleIcon className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Cerrar oferta</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
