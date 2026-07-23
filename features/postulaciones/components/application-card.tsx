"use client";

// Card de una postulación en "Mis postulaciones" (vista alumno). Puramente de
// presentación: recibe la fila ya resuelta por use-my-applications.ts.

import Link from "next/link";
import { BriefcaseIcon, CalendarIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ApplicationStatusBadge } from "@/features/postulaciones/components/application-status-badge";
import type { MyApplicationRow } from "@/features/postulaciones/types";

const dateFormatter = new Intl.DateTimeFormat("es-UY", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export function ApplicationCard({ row }: { row: MyApplicationRow }) {
  const { application, vacancy, companyName, areaName } = row;

  return (
    <Link
      href={`/feed/${vacancy.vacancyId}`}
      className="block rounded-xl transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <Card className="gap-3">
        <CardContent className="flex flex-1 flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <span className="truncate text-sm font-semibold text-primary">{companyName}</span>
            <ApplicationStatusBadge status={application.status} />
          </div>

          <div>
            <h3 className="font-semibold leading-snug">{vacancy.name}</h3>
            <p className="text-sm text-muted-foreground">{companyName}</p>
          </div>

          <Badge variant="secondary" className="w-fit">
            {areaName}
          </Badge>

          <div className="mt-auto flex flex-col gap-1.5 pt-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <BriefcaseIcon className="size-4 shrink-0" aria-hidden />
              {vacancy.contractType}
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarIcon className="size-4 shrink-0" aria-hidden />
              Postulado el {dateFormatter.format(new Date(application.appliedAt))}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
