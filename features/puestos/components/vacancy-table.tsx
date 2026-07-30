"use client";

// Tabla de "Mis ofertas". Puramente de presentación: recibe las filas ya
// filtradas/ordenadas/paginadas por el hook y no sabe nada del origen de los
// datos ni de TanStack Query.

import { useState } from "react";
import Link from "next/link";
import { PencilIcon, PencilOffIcon, UserIcon, XCircleIcon } from "lucide-react";
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
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  VACANCY_STATUS_DESCRIPTION,
  VacancyStatusBadge,
} from "@/components/vacancies/vacancy-status-badge";
import { ApiError } from "@/lib/api-client";
import { useCloseJob } from "@/features/puestos/hooks/use-close-job";
import { MODALITY_LABELS } from "@/lib/modality";
import type { CompanyVacancyRow } from "@/features/puestos/types";

const dateFormatter = new Intl.DateTimeFormat("es-UY", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function formatDate(iso: string | null): string {
  return iso ? dateFormatter.format(new Date(iso)) : "—";
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
            <TableHead>Fecha de cierre</TableHead>
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
                  {vacancy.areaName} · {vacancy.location} · {MODALITY_LABELS[vacancy.modality]}
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
                {vacancy.unreviewedApplicantsCount > 0 && (
                  <p className="text-xs text-success">
                    +{vacancy.unreviewedApplicantsCount} sin revisar
                  </p>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(vacancy.publicationDate)}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(vacancy.closingDate)}
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
  const [confirmOpen, setConfirmOpen] = useState(false);
  const closeJob = useCloseJob();

  async function confirmClose() {
    try {
      await closeJob.close(vacancy.vacancyId);
      toast.success("Oferta finalizada. Ya no aparece en el feed de alumnos.");
      setConfirmOpen(false);
    } catch (cause) {
      toast.error(
        cause instanceof ApiError
          ? cause.message
          : "No se pudo finalizar la oferta. Intentá nuevamente.",
      );
    }
  }

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

      {/* Editar (PUT /vacancy/{id}) queda afuera en `FINALIZADO` (terminal,
          no tiene sentido seguir ajustando una búsqueda ya cerrada). Con
          >=1 postulantes (A-06, resuelto: no tiene sentido cambiarle los
          datos del puesto a alguien que ya se postuló) no se oculta el
          botón, se lo reemplaza por un lápiz tachado deshabilitado (ver más
          abajo) para que se entienda *por qué* no se puede editar, en vez de
          que el botón desaparezca sin explicación. `EditJobForm` mantiene el
          mismo gate de solo lectura por si se llega por URL directa. */}
      {vacancy.status !== "FINALIZADO" && vacancy.applicantsCount === 0 && vacancy.applicantsCountKnown && (
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
      )}

      {/* Tiene >=1 postulantes confirmados: lápiz tachado (`PencilOffIcon`),
          deshabilitado, en vez de ocultar el botón — el motivo ya se ve acá
          mismo, en la columna "Postulantes". */}
      {vacancy.status !== "FINALIZADO" &&
        vacancy.applicantsCount > 0 &&
        vacancy.applicantsCountKnown && (
          <Tooltip>
            {/* El `<span>` (no el `Button` deshabilitado) es el trigger real:
                `disabled:pointer-events-none` del propio `Button` (ver
                components/ui/button.tsx) le impediría recibir el hover que
                dispara el tooltip. */}
            <TooltipTrigger asChild>
              <span className="inline-flex" tabIndex={0}>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled
                  className="pointer-events-none"
                  aria-label={`No se puede editar ${vacancy.name}: ya tiene postulantes`}
                >
                  <PencilOffIcon className="size-4" />
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              No se puede editar una oferta con postulantes.
            </TooltipContent>
          </Tooltip>
        )}

      {/* `applicantsCountKnown === false` (falló `GET /vacancy-application`
          para esta fila): no hay forma de saber si tiene postulantes, así
          que se trata como si los tuviera (más seguro ocultar de más que
          dejar editar una oferta con postulantes reales). Se muestra un
          ícono deshabilitado en vez de ocultarlo del todo para que se
          entienda que es un problema transitorio, no que a esta oferta "no
          le corresponde" el botón de editar. */}
      {vacancy.status !== "FINALIZADO" &&
        vacancy.applicantsCount === 0 &&
        !vacancy.applicantsCountKnown && (
          <Tooltip>
            {/* El `<span>` (no el `Button` deshabilitado) es el trigger real:
                `disabled:pointer-events-none` del propio `Button` (ver
                components/ui/button.tsx) le impediría recibir el hover que
                dispara el tooltip. */}
            <TooltipTrigger asChild>
              <span className="inline-flex" tabIndex={0}>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled
                  className="pointer-events-none"
                  aria-label={`Editar ${vacancy.name}`}
                >
                  <PencilIcon className="size-4" />
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              No pudimos confirmar los postulantes de esta oferta. Recargá para reintentar.
            </TooltipContent>
          </Tooltip>
        )}

      {/* La empresa dueña solo puede cerrar, y solo desde `PUBLICADO`
          (RF-PUE-03). Retirar una vacante a `PENDIENTE` es potestad del
          Admin, no de la empresa — ver `VacancyStatus` en types/index.ts.
          Acción irreversible: pasa por un diálogo de confirmación, no se
          dispara directo desde el ícono. */}
      {vacancy.status === "PUBLICADO" && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive"
              aria-label={`Finalizar ${vacancy.name}`}
              onClick={() => setConfirmOpen(true)}
            >
              <XCircleIcon className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Finalizar oferta</TooltipContent>
        </Tooltip>
      )}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="pr-8">
            <DialogTitle className="text-lg">¿Finalizar esta oferta?</DialogTitle>
            <DialogDescription>
              <strong>{vacancy.name}</strong> deja de verse en el feed. Esta acción es{" "}
              <strong>irreversible</strong>: no se puede volver a publicar.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button" className="w-full sm:w-auto">
                Cancelar
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              type="button"
              onClick={confirmClose}
              disabled={closeJob.isLoading}
              className="w-full sm:w-auto"
            >
              {closeJob.isLoading ? "Finalizando..." : "Sí, finalizar oferta"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
