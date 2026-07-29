"use client";

// Detalle de una vacante (vista alumno) — RF-PUE / RF-14: título, empresa,
// descripción y requisitos completos, con la acción de postularse.
//
// Orquestador: junta la vacante (features/puestos) con la sesión
// (features/auth) para resolver el gate de RN-16/RN-05 del botón "Aplicar".
// La mutación de postularse vive en features/puestos/hooks/use-vacancy.ts —
// ver el comentario ahí sobre por qué no está en features/postulaciones.

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeftIcon,
  BriefcaseIcon,
  CalendarIcon,
  CircleUserRoundIcon,
  ClipboardCheckIcon,
  ClipboardListIcon,
  ExternalLinkIcon,
  FileTextIcon,
  GlobeIcon,
  MapPinIcon,
} from "lucide-react";
import { toast } from "sonner";

import { usePageBreadcrumb } from "@/components/layout/breadcrumb-context";
import { EmptyState } from "@/components/layout/empty-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApiError } from "@/lib/api-client";
import { useSession } from "@/hooks/use-session";
import { getVacancyDetailPreviewExtras } from "@/features/puestos/components/vacancy-detail-preview-mock";
import { useApplyToVacancy, useHasApplied, useVacancy } from "@/features/puestos/hooks/use-vacancy";
import type { VacancyDetail } from "@/features/puestos/types";
import type { AccountStatus, ContractType, Modality } from "@/types";

const MODALITY_LABEL: Record<Modality, string> = {
  PRESENCIAL: "Presencial",
  REMOTO: "Remota",
  HIBRIDO: "Híbrida",
};

// Enum real de Backend (`vacancy/ContractType.java`) — ver el aviso en
// `job-basic-info-form.tsx`.
const CONTRACT_TYPE_LABEL: Record<ContractType, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  FREELANCE: "Freelance",
  PASANTIA: "Pasantía",
  CONTRATO_FIJO: "Contrato fijo",
  CONTRATO_INDEFINIDO: "Contrato indefinido",
  SUPLENCIA: "Suplencia",
  BECA: "Beca",
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
  usePageBreadcrumb(isLoading ? undefined : (vacancy?.name ?? null));

  // Esta vista se monta en dos rutas: /feed/[id] (desde el feed) y
  // /postulaciones/[id] (desde "Mis postulaciones" — ver el detalle de una
  // postulación no debería sentirse "dentro de Vacantes", ni en el
  // breadcrumb del Navbar ni acá). "Volver" respeta desde dónde se entró.
  const pathname = usePathname();
  const backHref = pathname.startsWith("/postulaciones") ? "/postulaciones" : "/feed";

  return (
    <div className="flex flex-col gap-4">
      <Link
        href={backHref}
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
  // 🔴 preview: ver vacancy-detail-preview-mock.ts — nada de esto es contrato real todavía.
  const extras = getVacancyDetailPreviewExtras(vacancy);

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="flex flex-col gap-4">
          <div className="flex gap-3">
            <Avatar size="lg">
              <AvatarImage src={extras.logoUrl} alt={vacancy.company.name} />
              <AvatarFallback className="font-medium">
                {companyInitials(vacancy.company.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h1 className="text-xl font-semibold tracking-tight">{vacancy.name}</h1>
              <p className="mt-0.5 text-sm text-muted-foreground">{vacancy.company.name}</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <MapPinIcon className="size-4" />
                {vacancy.location}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <BriefcaseIcon className="size-4" />
                {CONTRACT_TYPE_LABEL[vacancy.contractType]}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarIcon className="size-4" />
                {formatDate(vacancy.publicationDate)}
              </span>
            </div>

            <ApplyAction vacancy={vacancy} />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Tabs defaultValue="descripcion">
            <TabsList variant="line">
              <TabsTrigger value="descripcion" className="after:bg-secondary-blue">
                <FileTextIcon />
                Descripción
              </TabsTrigger>
              <TabsTrigger value="requisitos" className="after:bg-secondary-blue">
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
                <Avatar>
                  <AvatarImage src={extras.logoUrl} alt={vacancy.company.name} />
                  <AvatarFallback className="font-medium">
                    {companyInitials(vacancy.company.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate font-medium">{vacancy.company.name}</p>
                  <p className="text-sm text-muted-foreground">{vacancy.company.industry}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{vacancy.company.description}</p>

              <DetailRow
                label="Tamaño"
                value={<span className="inline-flex items-center gap-1"><CircleUserRoundIcon className="size-3.5" />{extras.companySize}</span>}
              />
              <DetailRow label="Fundada en" value={extras.foundedYear} />

              {(vacancy.company.webUrl || vacancy.company.linkedinUrl) && (
                <div className="flex flex-col gap-1.5 border-t pt-3">
                  {vacancy.company.webUrl && (
                    <a
                      href={vacancy.company.webUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                    >
                      <GlobeIcon className="size-4" />
                      Sitio web
                      <ExternalLinkIcon className="size-3" />
                    </a>
                  )}
                  {vacancy.company.linkedinUrl && (
                    <a
                      href={vacancy.company.linkedinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                    >
                      <ExternalLinkIcon className="size-4" />
                      LinkedIn
                    </a>
                  )}
                </div>
              )}
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
              {vacancy.salary && (
                <DetailRow label="Rango salarial" value={vacancy.salary} />
              )}

              <div className="flex flex-col gap-1.5 border-t pt-3">
                <span className="text-muted-foreground">Habilidades requeridas</span>
                <div className="flex flex-wrap gap-1.5">
                  {extras.skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="bg-secondary-blue text-secondary-blue-foreground"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {extras.requiresQuestionnaire && (
                <div className="flex items-start gap-2 rounded-lg bg-muted p-3 text-muted-foreground">
                  <ClipboardCheckIcon className="size-4 shrink-0" />
                  Esta vacante requiere completar un cuestionario adicional al postularte.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
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

/** Botón "Aplicar" con el gate de RN-16 (cuenta no `APROBADO`) y RN-05 (ya
 *  postulado), y la mutación real de `POST /vacancy-application`. */
function ApplyAction({ vacancy }: { vacancy: VacancyDetail }) {
  const { user, isLoading } = useSession();
  const hasApplied = useHasApplied(vacancy.vacancyId, user?.userId);
  const { apply, isLoading: isApplying } = useApplyToVacancy(vacancy.vacancyId, user?.userId);

  if (isLoading || !user) {
    return <Skeleton className="h-10 w-32 shrink-0" />;
  }

  if (vacancy.status === "FINALIZADO") {
    return (
      <Button className="h-10 shrink-0 px-6" disabled>
        Vacante finalizada
      </Button>
    );
  }

  // El backend solo acepta postulaciones a vacantes `PUBLICADO` (`409` si no
  // — verificado contra `VacancyApplicationServiceImpl.create`, fuente del
  // backend). Una vacante `PENDIENTE` sigue siendo visible acá (se llega por
  // link directo o desde "Mis postulaciones"), pero no se puede aplicar.
  if (vacancy.status === "PENDIENTE") {
    return (
      <Button className="h-10 shrink-0 px-6" disabled>
        Vacante en revisión
      </Button>
    );
  }

  if (hasApplied) {
    return (
      <Button variant="outline" className="h-10 shrink-0 px-6" disabled>
        Ya te postulaste
      </Button>
    );
  }

  const blockedMessage = PENDING_STATUS_MESSAGE[user.status];

  return (
    <div className="flex shrink-0 flex-col items-end gap-1.5">
      <Button
        className="h-10 bg-ucu-blue px-6 text-white hover:bg-ucu-blue/90"
        disabled={Boolean(blockedMessage) || isApplying}
        onClick={async () => {
          try {
            await apply();
            toast.success("¡Te postulaste con éxito!");
          } catch (err) {
            // Un 409 acá puede ser "ya postulado", "vacante no PUBLICADO" o
            // "falta cargar Education" (los tres son 409 reales del
            // backend) — se muestra el `detail` real en vez de adivinar.
            toast.error(
              err instanceof ApiError
                ? err.message
                : "No se pudo enviar la postulación. Intentá nuevamente.",
            );
          }
        }}
      >
        {isApplying ? "Postulando..." : "Aplicar"}
      </Button>
      {blockedMessage && (
        <p className="max-w-56 text-right text-xs text-muted-foreground">{blockedMessage}</p>
      )}
    </div>
  );
}

function VacancyDetailSkeleton() {
  return (
    <div className="flex flex-col gap-4">
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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Skeleton className="h-64 w-full rounded-xl lg:col-span-2" />
        <div className="flex flex-col gap-4">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
