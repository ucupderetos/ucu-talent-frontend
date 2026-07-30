// Card de una postulación en "Mis postulaciones" (vista alumno). Ancha, en
// lista de a una por fila (no en grilla) — puramente de presentación, recibe
// la fila ya resuelta por use-my-applications.ts.

import Link from "next/link";
import { BriefcaseIcon, CalendarIcon, ChevronRightIcon } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ApplicationProgress } from "@/features/postulaciones/components/application-progress";
import { ApplicationStatusBadge } from "@/components/vacancies/application-status-badge";
import { CONTRACT_TYPE_LABELS } from "@/lib/contract-types";
import type { MyApplicationRow } from "@/features/postulaciones/types";

const dateFormatter = new Intl.DateTimeFormat("es-UY", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export function ApplicationCard({ row }: { row: MyApplicationRow }) {
  const { application, vacancy, companyName, areaName } = row;

  return (
    <Card className="gap-4">
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            {/* Sin logoUrl en el modelo todavía (A-11, `docs/agents/open-questions.md`) — fallback
             *  con la inicial de la empresa, mismo criterio que el avatar del
             *  navbar. */}
            <Avatar className="size-12 shrink-0">
              <AvatarFallback>{companyName.charAt(0)}</AvatarFallback>
            </Avatar>

            <div className="min-w-0">
              <h3 className="font-semibold leading-snug">{vacancy.name}</h3>
              <p className="text-sm text-muted-foreground">{companyName}</p>

              <Badge
                variant="secondary"
                className="mt-2 w-fit bg-secondary-blue text-secondary-blue-foreground"
              >
                {areaName}
              </Badge>
            </div>
          </div>

          <ApplicationStatusBadge status={application.status} />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <BriefcaseIcon className="size-4 shrink-0" aria-hidden />
              {CONTRACT_TYPE_LABELS[vacancy.contractType] ?? vacancy.contractType}
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarIcon className="size-4 shrink-0" aria-hidden />
              Aplicaste el {dateFormatter.format(new Date(application.appliedAt))}
            </span>
          </div>

          <Button
            size="sm"
            className="bg-secondary-blue text-secondary-blue-foreground hover:bg-secondary-blue/90"
            asChild
          >
            <Link href={`/postulaciones/${vacancy.vacancyId}`}>
              Ver detalle
              <ChevronRightIcon />
            </Link>
          </Button>
        </div>

        <Separator />

        <ApplicationProgress application={application} />
      </CardContent>
    </Card>
  );
}
