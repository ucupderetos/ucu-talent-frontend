"use client";

// Detalle de una vacante (vista alumno) — RF-PUE / RF-14: título, empresa,
// descripción y requisitos completos, con la acción de postularse.
//
// Orquestador: junta la vacante (features/puestos) con la sesión
// (features/auth) para resolver el gate de RN-16/RN-05 del botón "Aplicar".
// La postulación en sí (features/postulaciones) todavía no tiene mutación —
// ver el comentario en ApplyAction más abajo.

import Link from "next/link";
import {
  ArrowLeftIcon,
  BriefcaseIcon,
  CalendarIcon,
  ClipboardListIcon,
  FileTextIcon,
  MapPinIcon,
} from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/layout/empty-state";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "@/features/auth/hooks/use-session";
import { hasAppliedToVacancy, useVacancy } from "@/features/puestos/hooks/use-vacancy";
import type { VacancyDetail } from "@/features/puestos/types";
import type { AccountStatus, Modality } from "@/types";

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
  return iso ? dateFormatter.format(new Date(iso)) : "Sin fecha de publicación";
}

function companyInitials(name: string): string {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase())
      .join("") || "?"
  );
}

export function VacancyDetailView({ vacancyId }: { vacancyId: string }) {
  const { data: vacancy, isLoading, isError } = useVacancy(vacancyId);

  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/feed"
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" />
        Volver
      </Link>

      {isLoading && <VacancyDetailSkeleton />}

      {!isLoading && (isError || !vacancy) && (
        <EmptyState
          title="No encontramos esta vacante"
          description="Puede que haya sido dada de baja o que el link esté mal escrito."
        />
      )}

      {!isLoading && vacancy && <VacancyDetailContent vacancy={vacancy} />}
    </div>
  );
}

function VacancyDetailContent({ vacancy }: { vacancy: VacancyDetail }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="flex flex-col gap-4 lg:col-span-2">
        <Card>
          <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-3">
              <Avatar size="lg" className="rounded-lg">
                <AvatarFallback className="rounded-lg font-medium">
                  {companyInitials(vacancy.company.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <h1 className="text-xl font-semibold tracking-tight">{vacancy.name}</h1>
                <p className="mt-0.5 text-sm text-muted-foreground">{vacancy.company.name}</p>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPinIcon className="size-4" />
                    {vacancy.location}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <BriefcaseIcon className="size-4" />
                    {vacancy.contractType}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarIcon className="size-4" />
                    {formatDate(vacancy.publicationDate)}
                  </span>
                </div>
              </div>
            </div>

            <ApplyAction vacancy={vacancy} />
          </CardContent>
        </Card>

        <Tabs defaultValue="descripcion">
          <TabsList variant="line">
            <TabsTrigger value="descripcion">
              <FileTextIcon />
              Descripción
            </TabsTrigger>
            <TabsTrigger value="requisitos">
              <ClipboardListIcon />
              Requisitos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="descripcion">
            <Card>
              <CardContent className="whitespace-pre-line text-sm text-foreground/90">
                {vacancy.description}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requisitos">
            <Card>
              <CardContent className="whitespace-pre-line text-sm text-foreground/90">
                {vacancy.requirements}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Sobre la empresa</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Avatar className="rounded-lg">
                <AvatarFallback className="rounded-lg font-medium">
                  {companyInitials(vacancy.company.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate font-medium">{vacancy.company.name}</p>
                <p className="text-sm text-muted-foreground">{vacancy.company.industry}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{vacancy.company.description}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detalles de la vacante</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <DetailRow label="Área" value={vacancy.areaName} />
            {vacancy.parentAreaName && (
              <DetailRow label="Área general" value={vacancy.parentAreaName} />
            )}
            <DetailRow
              label="Modalidad"
              value={<Badge variant="outline">{MODALITY_LABEL[vacancy.modality]}</Badge>}
            />
            {vacancy.salaryRange && <DetailRow label="Rango salarial" value={vacancy.salaryRange} />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

const PENDING_STATUS_MESSAGE: Partial<Record<AccountStatus, string>> = {
  PENDIENTE: "Tu cuenta está pendiente de aprobación. Vas a poder postularte cuando se apruebe.",
  RECHAZADO: "Tu cuenta no fue aprobada, así que no podés postularte a vacantes.",
};

/**
 * Botón "Aplicar" con el gate de RN-16 (cuenta no `APROBADO`) y RN-05 (ya
 * postulado). La creación de la postulación en sí (`features/postulaciones`)
 * todavía no tiene mutación — el dominio no tiene ni un hook escrito (ver
 * AGENTS.md, "Todavía NO existe"). Mientras tanto, igual que "Crear nueva
 * oferta"/"Cerrar" en el dominio empresa, el click solo avisa que falta el
 * contrato de la API.
 */
function ApplyAction({ vacancy }: { vacancy: VacancyDetail }) {
  const { user, isLoading } = useSession();

  if (isLoading || !user) {
    return <Skeleton className="h-11 w-32 shrink-0" />;
  }

  if (vacancy.status === "FINALIZADO") {
    return (
      <Button size="lg" className="h-11 shrink-0" disabled>
        Vacante finalizada
      </Button>
    );
  }

  if (hasAppliedToVacancy(vacancy.vacancyId, user.userId)) {
    return (
      <Button size="lg" variant="outline" className="h-11 shrink-0" disabled>
        Ya te postulaste
      </Button>
    );
  }

  const blockedMessage = PENDING_STATUS_MESSAGE[user.status];

  return (
    <div className="flex shrink-0 flex-col items-end gap-1.5">
      <Button
        size="lg"
        className="h-11"
        disabled={Boolean(blockedMessage)}
        onClick={() =>
          toast.info('Postularte todavía no está disponible: falta el contrato de la API.')
        }
      >
        Aplicar
      </Button>
      {blockedMessage && (
        <p className="max-w-56 text-right text-xs text-muted-foreground">{blockedMessage}</p>
      )}
    </div>
  );
}

function VacancyDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="flex flex-col gap-4 lg:col-span-2">
        <Card>
          <CardContent className="flex items-start gap-3">
            <Skeleton className="size-10 rounded-lg" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-6 w-56" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-72" />
            </div>
          </CardContent>
        </Card>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
      <div className="flex flex-col gap-4">
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    </div>
  );
}
