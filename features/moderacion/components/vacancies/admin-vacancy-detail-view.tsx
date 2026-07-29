"use client";

// Detalle completo de una oferta para el Admin UCU. Toma la estructura del
// detalle del feed, pero elimina la acción de postularse y todos los extras de
// preview que no existen en el contrato (logo, tamaño/fundación de empresa,
// skills y cuestionario). Solo presenta Vacancy y sus relaciones reales.

import Link from "next/link";
import {
  ArrowLeftIcon,
  BriefcaseIcon,
  BuildingIcon,
  CalendarDaysIcon,
  ClipboardListIcon,
  ExternalLinkIcon,
  FileTextIcon,
  GlobeIcon,
  LinkIcon,
  MapPinIcon,
  TagsIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";

import { usePageBreadcrumb } from "@/components/layout/breadcrumb-context";
import { EmptyState } from "@/components/layout/empty-state";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  VACANCY_STATUS_DESCRIPTION,
  VacancyStatusBadge,
} from "@/components/vacancies/vacancy-status-badge";
import { CompanyStatusBadge } from "@/features/moderacion/components/companies/company-status-badge";
import { VACANCY_MODALITY_LABEL } from "@/features/moderacion/components/vacancies/vacancy-labels";
import { VacancyActionsMenu } from "@/features/moderacion/components/vacancies/vacancy-actions-menu";
import { useAdminVacancyDetail } from "@/features/moderacion/hooks/use-admin-vacancies";
import { CONTRACT_TYPE_LABELS } from "@/lib/contract-types";
import type { AdminVacancyDetail } from "@/features/moderacion/types";
import type { VacancyApplicationStatus } from "@/types";

const VACANCIES_ROUTE = "/moderacion/ofertas";

const APPLICATION_STATUS_LABEL: Record<VacancyApplicationStatus, string> = {
  PENDIENTE: "Pendientes",
  VISTO: "Vistas",
  FINALIZADO: "Finalizadas",
};

const dateFormatter = new Intl.DateTimeFormat("es-UY", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

function formatDate(iso: string | null, emptyLabel: string): string {
  return iso ? dateFormatter.format(new Date(iso)) : emptyLabel;
}

function formatDepartment(department: string): string {
  return department
    .toLocaleLowerCase("es")
    .split("_")
    .map((word) => word.charAt(0).toLocaleUpperCase("es") + word.slice(1))
    .join(" ");
}

export function AdminVacancyDetailView({ vacancyId }: { vacancyId: string }) {
  const { data: vacancy, isLoading, isError } = useAdminVacancyDetail(vacancyId);

  usePageBreadcrumb(isLoading ? undefined : (vacancy?.name ?? null));

  return (
    <div className="flex flex-col gap-6">
      <BackLink />

      {isLoading && <AdminVacancyDetailSkeleton />}

      {!isLoading && (isError || !vacancy) && (
        <EmptyState
          title={isError ? "No pudimos cargar esta oferta" : "No encontramos esta oferta"}
          description={
            isError
              ? "Revisá tu conexión y volvé a intentar."
              : "Puede que la oferta ya no exista o que el enlace sea incorrecto."
          }
        />
      )}

      {!isLoading && !isError && vacancy && <VacancyDetailContent vacancy={vacancy} />}
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href={VACANCIES_ROUTE}
      className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:rounded-sm focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <ArrowLeftIcon className="size-4" aria-hidden />
      Volver a ofertas
    </Link>
  );
}

function VacancyDetailContent({ vacancy }: { vacancy: AdminVacancyDetail }) {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <Avatar className="size-14 rounded-lg">
                <AvatarFallback className="rounded-lg bg-primary/10 font-semibold text-primary">
                  {vacancy.companyInitials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                  {vacancy.name}
                </h1>
                {vacancy.company ? (
                  <Link
                    href={`/moderacion/empresas/${vacancy.companyId}`}
                    className="mt-1 inline-flex rounded-sm text-sm text-muted-foreground outline-none transition-colors hover:text-primary hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    {vacancy.companyName}
                  </Link>
                ) : (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {vacancy.companyName}
                  </p>
                )}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <VacancyStatusBadge status={vacancy.status} />
              <VacancyActionsMenu vacancy={vacancy} />
            </div>
          </div>

          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <OverviewItem
              icon={MapPinIcon}
              label="Ubicación"
              value={formatDepartment(vacancy.location)}
            />
            <OverviewItem
              icon={BriefcaseIcon}
              label="Tipo de contrato"
              value={CONTRACT_TYPE_LABELS[vacancy.contractType] ?? vacancy.contractType}
            />
            <OverviewItem
              icon={BuildingIcon}
              label="Modalidad"
              value={VACANCY_MODALITY_LABEL[vacancy.modality]}
            />
            <OverviewItem
              icon={CalendarDaysIcon}
              label="Publicación"
              value={formatDate(vacancy.publicationDate, "Sin publicar")}
            />
          </dl>
        </CardContent>
      </Card>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
        <div className="flex min-w-0 flex-col gap-4">
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
                <CardContent className="whitespace-pre-line text-sm leading-6 text-foreground/90">
                  {vacancy.description}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="requisitos">
              <Card>
                <CardContent className="whitespace-pre-line text-sm leading-6 text-foreground/90">
                  {vacancy.requirements}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <ApplicationsSummary vacancy={vacancy} />
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <VacancyInformation vacancy={vacancy} />
          <CompanyInformation vacancy={vacancy} />
        </div>
      </div>
    </div>
  );
}

function OverviewItem({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-lg border bg-muted/20 p-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-background ring-1 ring-foreground/10">
        <Icon className="size-4 text-muted-foreground" aria-hidden />
      </div>
      <div className="min-w-0">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="break-words text-sm font-medium">{value}</dd>
      </div>
    </div>
  );
}

function ApplicationsSummary({ vacancy }: { vacancy: AdminVacancyDetail }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5">
          <UsersIcon className="size-4" aria-hidden />
          Postulaciones
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <SummaryMetric label="Total" value={vacancy.applicationCount} />
        {Object.entries(vacancy.applicationStatusCounts).map(([status, count]) => (
          <SummaryMetric
            key={status}
            label={APPLICATION_STATUS_LABEL[status as VacancyApplicationStatus]}
            value={count}
          />
        ))}
        <SummaryMetric label="Seleccionadas" value={vacancy.selectedApplicationCount} />
      </CardContent>
    </Card>
  );
}

function SummaryMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-muted/20 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold tracking-tight">
        {value.toLocaleString("es-UY")}
      </p>
    </div>
  );
}

function VacancyInformation({ vacancy }: { vacancy: AdminVacancyDetail }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5">
          <TagsIcon className="size-4" aria-hidden />
          Detalles de la oferta
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm">
        <DetailRow label="Identificador" value={vacancy.vacancyId} />
        <DetailRow label="Área" value={vacancy.area?.name ?? "No disponible"} />
        {vacancy.parentArea && (
          <DetailRow label="Área general" value={vacancy.parentArea.name} />
        )}
        <DetailRow
          label="Tipo de contrato"
          value={CONTRACT_TYPE_LABELS[vacancy.contractType] ?? vacancy.contractType}
        />
        <DetailRow
          label="Modalidad"
          value={<Badge variant="outline">{VACANCY_MODALITY_LABEL[vacancy.modality]}</Badge>}
        />
        <DetailRow label="Ubicación" value={formatDepartment(vacancy.location)} />
        <DetailRow
          label="Remuneración"
          value={vacancy.salary || "No especificada"}
        />
        <DetailRow
          label="Publicación"
          value={formatDate(vacancy.publicationDate, "Sin publicar")}
        />
        <DetailRow
          label="Cierre"
          value={formatDate(vacancy.closingDate, "Sin fecha de cierre")}
        />
        <Separator />
        <div className="flex flex-col gap-1.5">
          <span className="text-muted-foreground">Estado</span>
          <div className="flex flex-wrap items-center gap-2">
            <VacancyStatusBadge status={vacancy.status} />
            <span className="text-xs text-muted-foreground">
              {VACANCY_STATUS_DESCRIPTION[vacancy.status]}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CompanyInformation({ vacancy }: { vacancy: AdminVacancyDetail }) {
  const { company, companyUser } = vacancy;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5">
          <BuildingIcon className="size-4" aria-hidden />
          Empresa
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Link
          href={`/moderacion/empresas/${vacancy.companyId}`}
          className="flex items-center gap-3 rounded-sm outline-none hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <Avatar className="size-10 rounded-lg">
            <AvatarFallback className="rounded-lg bg-primary/10 font-medium text-primary">
              {vacancy.companyInitials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-medium hover:underline">{vacancy.companyName}</p>
            {company && (
              <p className="truncate text-sm text-muted-foreground">{company.industry}</p>
            )}
          </div>
        </Link>

        {company ? (
          <>
            <p className="whitespace-pre-line text-sm leading-6 text-muted-foreground">
              {company.description}
            </p>
            <Separator />
            <DetailRow label="Rubro" value={company.industry} />
            <DetailRow label="Ubicación" value={formatDepartment(company.location)} />

            {companyUser && (
              <>
                <DetailRow
                  label="Estado de cuenta"
                  value={<CompanyStatusBadge status={companyUser.status} />}
                />
                <DetailRow
                  label="Correo"
                  value={
                    <ContactLink href={`mailto:${companyUser.email}`}>
                      {companyUser.email}
                    </ContactLink>
                  }
                />
                <DetailRow
                  label="Registrada"
                  value={formatDate(companyUser.registeredAt, "Sin fecha")}
                />
              </>
            )}

            {(company.webUrl || company.linkedinUrl) && (
              <>
                <Separator />
                {company.webUrl && (
                  <CompanyExternalLink
                    href={company.webUrl}
                    label="Sitio web"
                    icon={GlobeIcon}
                  />
                )}
                {company.linkedinUrl && (
                  <CompanyExternalLink
                    href={company.linkedinUrl}
                    label="LinkedIn"
                    icon={LinkIcon}
                  />
                )}
              </>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            No encontramos la información de esta empresa.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="min-w-0 break-words text-right font-medium">{value}</span>
    </div>
  );
}

function ContactLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="rounded-sm text-primary outline-none underline-offset-4 hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      {children}
    </a>
  );
}

function CompanyExternalLink({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group flex min-w-0 items-center gap-3 rounded-lg border bg-muted/20 p-3 outline-none transition-colors hover:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="truncate text-xs text-muted-foreground">{href}</p>
      </div>
      <ExternalLinkIcon
        className="size-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
        aria-hidden
      />
    </a>
  );
}

function AdminVacancyDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-60 rounded-xl" />
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-44 rounded-xl" />
        </div>
        <div className="flex flex-col gap-4">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
