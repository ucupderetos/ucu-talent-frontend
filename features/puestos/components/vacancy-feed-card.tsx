"use client";

// Card de una vacante en el feed del alumno (RF-14). Puramente de
// presentación: recibe la fila ya resuelta por use-feed-vacancies.ts.

import Link from "next/link";
import { BriefcaseIcon, MapPinIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CONTRACT_TYPE_LABELS } from "@/lib/contract-types";
import { DEPARTMENT_LABELS } from "@/lib/departments";
import type { FeedVacancyRow } from "@/features/puestos/types";

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
          <span className="truncate text-sm font-semibold text-primary">
            {vacancy.companyName}
          </span>

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
              {DEPARTMENT_LABELS[vacancy.location]}, Uruguay
            </span>
            <span className="flex items-center gap-1.5">
              <BriefcaseIcon className="size-4 shrink-0" aria-hidden />
              {CONTRACT_TYPE_LABELS[vacancy.contractType] ?? vacancy.contractType}
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
