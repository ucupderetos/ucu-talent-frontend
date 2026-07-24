"use client";

// Detalle administrativo de una empresa. Registra su nombre en el breadcrumb
// del Navbar: sin esto, al haber un item de nav en /moderacion/empresas la
// pantalla matchea como anidada y el header queda con un Skeleton para siempre
// (ver el aviso en components/layout/nav-items.ts).

import Link from "next/link";
import {
  ArrowLeftIcon,
  CalendarDaysIcon,
  ExternalLinkIcon,
  GlobeIcon,
  LinkIcon,
  MailIcon,
  MapPinIcon,
  TagsIcon,
  type LucideIcon,
} from "lucide-react";

import { EmptyState } from "@/components/layout/empty-state";
import { usePageBreadcrumb } from "@/components/layout/breadcrumb-context";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CompanyModerationActions } from "@/features/moderacion/components/companies/company-moderation-actions";
import { CompanyStatusBadge } from "@/features/moderacion/components/companies/company-status-badge";
import { useAdminCompanyDetail } from "@/features/moderacion/hooks/use-admin-companies";
import type { AccountStatus } from "@/types";

const COMPANIES_ROUTE = "/moderacion/empresas";

const dateFormatter = new Intl.DateTimeFormat("es-UY", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

const moderationMessage: Record<AccountStatus, string> = {
  PENDIENTE:
    "Revisá la información de la empresa antes de aprobar o rechazar su registro.",
  APROBADO:
    "La empresa está habilitada para publicar vacantes. Podés darla de baja si deja de cumplir los requisitos.",
  RECHAZADO:
    "La empresa está rechazada y no puede publicar nuevas vacantes.",
};

export function CompanyDetailView({ companyId }: { companyId: string }) {
  const { data: company, isLoading, isError } = useAdminCompanyDetail(companyId);

  // `undefined` mientras carga (Skeleton en el navbar), `null` si no se
  // encontró (el navbar deja solo la sección).
  usePageBreadcrumb(isLoading ? undefined : (company?.name ?? null));

  if (isLoading) {
    return <DetailSkeleton />;
  }

  if (isError || !company) {
    return (
      <EmptyState
        title={isError ? "No pudimos cargar esta empresa" : "No encontramos esta empresa"}
        description={
          isError
            ? "Revisá tu conexión y volvé a intentar."
            : "Puede que la empresa ya no exista o que el enlace sea incorrecto."
        }
        action={
          <Button asChild variant="outline">
            <Link href={COMPANIES_ROUTE}>Volver al listado</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Link
        href={COMPANIES_ROUTE}
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <ArrowLeftIcon className="size-4" aria-hidden />
        Volver a empresas
      </Link>

      <Card>
        <CardContent className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
            <Avatar className="size-20 sm:size-24">
              <AvatarFallback className="bg-primary/10 text-xl font-semibold text-primary sm:text-2xl">
                {company.initials}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                  {company.name}
                </h1>
                <CompanyStatusBadge status={company.status} />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Perfil registrado en UCU Talent
              </p>
            </div>
          </div>

          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <CompanyInformationItem
              icon={MapPinIcon}
              label="Ubicación"
              value={company.location}
            />
            <CompanyInformationItem
              icon={TagsIcon}
              label="Industria"
              value={company.industry}
            />
            <CompanyInformationItem
              icon={MailIcon}
              label="Correo"
              value={company.email}
            />
          </dl>

          <div className="flex flex-col gap-3 border-t pt-5 lg:flex-row lg:items-center lg:justify-between">
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              {moderationMessage[company.status]}
            </p>
            <CompanyModerationActions company={company} />
          </div>
        </CardContent>
      </Card>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(16rem,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Sobre la empresa</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line text-sm leading-6 text-foreground/90">
              {company.description}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información adicional</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <CompanyLink
              href={company.webUrl}
              icon={GlobeIcon}
              label="Sitio web"
            />
            <CompanyLink
              href={company.linkedinUrl}
              icon={LinkIcon}
              label="LinkedIn"
            />
            <div className="flex min-w-0 items-center gap-3 rounded-lg border bg-muted/20 p-3">
              <CalendarDaysIcon
                className="size-5 shrink-0 text-muted-foreground"
                aria-hidden
              />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Registrada el</p>
                <p className="truncate text-sm font-medium">
                  {dateFormatter.format(new Date(company.registeredAt))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-5 w-36" />
      <Skeleton className="h-56 rounded-xl" />
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(16rem,1fr)]">
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    </div>
  );
}

function CompanyInformationItem({
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

function CompanyLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group flex min-w-0 items-center gap-3 rounded-lg border bg-muted/20 p-3 outline-none transition-colors hover:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <Icon className="size-5 shrink-0 text-muted-foreground" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">Abrir en otra pestaña</p>
      </div>
      <ExternalLinkIcon
        className="size-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
        aria-hidden
      />
    </a>
  );
}
