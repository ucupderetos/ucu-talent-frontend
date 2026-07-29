"use client";

// Card de una vacante en el feed del alumno (RF-14). Puramente de
// presentación: recibe la fila ya resuelta por use-feed-vacancies.ts.

import Link from "next/link";
import { BookmarkIcon, BriefcaseIcon, MapPinIcon } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { FeedVacancyRow } from "@/features/puestos/types";
import type { ContractType, Department } from "@/types";

/** Enum real de Backend (`vacancy/ContractType.java`) — ver el aviso en
 *  `job-basic-info-form.tsx`. Exportado por el mismo motivo que
 *  `DEPARTMENT_LABEL` abajo: `vacancy-feed-table.tsx` lo reusa. */
export const CONTRACT_TYPE_LABEL: Record<ContractType, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  FREELANCE: "Freelance",
  PASANTIA: "Pasantía",
  CONTRATO_FIJO: "Contrato fijo",
  CONTRATO_INDEFINIDO: "Contrato indefinido",
  SUPLENCIA: "Suplencia",
  BECA: "Beca",
};

/**
 * Duplica el diccionario de RegisterForm.tsx/CompleteProfileForm.tsx — no hay
 * todavía un lugar compartido para labels de `Department` (los 19 valores
 * reales, ver docs/ENDPOINTS.md). Exportado para que `vacancy-feed-table.tsx`
 * (la vista en lista del mismo feed) no agregue una quinta copia.
 */
export const DEPARTMENT_LABEL: Record<Department, string> = {
  ARTIGAS: "Artigas",
  CANELONES: "Canelones",
  CERRO_LARGO: "Cerro Largo",
  COLONIA: "Colonia",
  DURAZNO: "Durazno",
  FLORES: "Flores",
  FLORIDA: "Florida",
  LAVALLEJA: "Lavalleja",
  MALDONADO: "Maldonado",
  MONTEVIDEO: "Montevideo",
  PAYSANDU: "Paysandú",
  RIO_NEGRO: "Río Negro",
  RIVERA: "Rivera",
  ROCHA: "Rocha",
  SALTO: "Salto",
  SAN_JOSE: "San José",
  SORIANO: "Soriano",
  TACUAREMBO: "Tacuarembó",
  TREINTA_Y_TRES: "Treinta y Tres",
};

export const dateFormatter = new Intl.DateTimeFormat("es-UY", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export function VacancyFeedCard({ vacancy }: { vacancy: FeedVacancyRow }) {
  return (
    <Link
      href={`/feed/${vacancy.vacancyId}`}
      className="block rounded-xl transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <Card className="gap-3">
        <CardContent className="flex flex-1 flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <span className="truncate text-sm font-semibold text-primary">
              {vacancy.companyName}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 shrink-0 text-muted-foreground"
              aria-label="Guardar vacante"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toast.info("Guardar vacantes todavía no está disponible.");
              }}
            >
              <BookmarkIcon className="size-4" />
            </Button>
          </div>

          <div>
            <h3 className="font-semibold leading-snug">{vacancy.name}</h3>
            <p className="text-sm text-muted-foreground">{vacancy.companyName}</p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <Badge variant="secondary" className="bg-secondary-blue text-secondary-blue-foreground">
              {vacancy.areaName}
            </Badge>
            {vacancy.parentAreaName && (
              <Badge variant="secondary" className="bg-secondary-blue text-secondary-blue-foreground">
                {vacancy.parentAreaName}
              </Badge>
            )}
          </div>

          <div className="mt-auto flex flex-col gap-1.5 pt-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <MapPinIcon className="size-4 shrink-0" aria-hidden />
              {DEPARTMENT_LABEL[vacancy.location]}, Uruguay
            </span>
            <span className="flex items-center gap-1.5">
              <BriefcaseIcon className="size-4 shrink-0" aria-hidden />
              {CONTRACT_TYPE_LABEL[vacancy.contractType]}
            </span>
          </div>

          <p className="text-xs text-muted-foreground">
            Publicado el {dateFormatter.format(new Date(vacancy.publicationDate))}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
