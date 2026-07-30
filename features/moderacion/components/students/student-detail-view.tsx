"use client";

// Detalle integral de un alumno para el Admin UCU. Sigue el patrón de página
// propia de `applicant-detail-view.tsx`, pero no ejecuta la transición de una
// postulación a VISTO: esta pantalla solo consulta información del alumno.
//
// Se muestran exclusivamente campos que existen en User, StudentProfile,
// Education/Degree/Area y WorkExperience. Foto, CV, domicilio, disponibilidad
// y notas de revisión no forman parte hoy de ese contrato y no se inventan.

import Link from "next/link";
import {
  ArrowLeftIcon,
  BriefcaseIcon,
  CalendarDaysIcon,
  ExternalLinkIcon,
  GraduationCapIcon,
  HashIcon,
  IdCardIcon,
  MailIcon,
  PhoneIcon,
  TagsIcon,
  UserRoundIcon,
  type LucideIcon,
} from "lucide-react";

import { EmptyState } from "@/components/layout/empty-state";
import { usePageBreadcrumb } from "@/components/layout/breadcrumb-context";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { AccountStatusBadge } from "@/features/moderacion/components/account-status-badge";
import { useAdminStudentDetail } from "@/features/moderacion/hooks/use-admin-student-detail";
import { StudentModerationActions } from "@/features/moderacion/components/students/student-moderation-actions";
import type { AdminStudentEducation } from "@/features/moderacion/types";
import type { AccountStatus, DegreeLevel, DocumentType, WorkExperience } from "@/types";

const STUDENTS_ROUTE = "/moderacion/estudiantes";

const DOCUMENT_TYPE_LABEL: Record<DocumentType, string> = {
  CEDULA_IDENTIDAD: "Cédula de identidad",
  DNI: "DNI",
  PASAPORTE: "Pasaporte",
};

const DEGREE_LEVEL_LABEL: Record<DegreeLevel, string> = {
  TECNICATURA: "Tecnicatura",
  LICENCIATURA: "Licenciatura",
  GRADO: "Grado",
  POSGRADO: "Posgrado",
  DOCTORADO: "Doctorado",
};

const MODERATION_MESSAGE: Record<AccountStatus, string> = {
  PENDIENTE:
    "Revisá la información del alumno antes de aprobar o rechazar su cuenta.",
  APROBADO:
    "El alumno está habilitado para postularse. Podés darlo de baja si deja de cumplir los requisitos.",
  RECHAZADO:
    "El alumno está rechazado y no puede postularse. Podés aprobarlo si la situación cambió.",
};

const dateFormatter = new Intl.DateTimeFormat("es-UY", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso));
}

function formatWorkDateRange({ startDate, endDate }: WorkExperience): string {
  if (!startDate) {
    return endDate ? `Hasta ${formatDate(endDate)}` : "Fechas no indicadas";
  }

  return `${formatDate(startDate)} – ${endDate ? formatDate(endDate) : "Actualidad"}`;
}

function initials(name: string, surname: string): string {
  return `${name.charAt(0)}${surname.charAt(0)}`.toUpperCase();
}

export function StudentDetailView({ studentProfileId }: { studentProfileId: string }) {
  const { data: student, isLoading, isError } = useAdminStudentDetail(studentProfileId);

  usePageBreadcrumb(
    isLoading
      ? undefined
      : student
        ? `${student.profile.name} ${student.profile.surname}`
        : null,
  );

  if (isLoading) {
    return <StudentDetailSkeleton />;
  }

  if (isError || !student) {
    return (
      <div className="flex flex-col gap-6">
        <BackLink />
        <EmptyState
          title={isError ? "No pudimos cargar este alumno" : "No encontramos este alumno"}
          description={
            isError
              ? "Revisá tu conexión y volvé a intentar."
              : "Puede que el alumno ya no exista o que el enlace sea incorrecto."
          }
        />
      </div>
    );
  }

  const { user, profile, education, workExperience } = student;

  return (
    <div className="flex flex-col gap-6">
      <BackLink />

      <div className="flex min-w-0 items-center gap-3">
        <Avatar size="lg">
          <AvatarFallback className="bg-primary/10 font-semibold text-primary">
            {initials(profile.name, profile.surname)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-2xl font-semibold tracking-tight">
              {profile.name} {profile.surname}
            </h1>
            <AccountStatusBadge status={user.status} />
          </div>
          <p className="mt-1 flex min-w-0 items-center gap-1 text-sm text-muted-foreground">
            <MailIcon className="size-3.5 shrink-0" aria-hidden />
            <span className="truncate">{user.email}</span>
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            {MODERATION_MESSAGE[user.status]}
          </p>
          <StudentModerationActions
            userId={user.userId}
            status={user.status}
            displayName={`${profile.name} ${profile.surname}`}
          />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5">
              <IdCardIcon className="size-4" aria-hidden />
              Cuenta e identificación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3 sm:grid-cols-2">
              <InformationItem
                icon={IdCardIcon}
                label="Documento"
                value={`${DOCUMENT_TYPE_LABEL[profile.documentType]} ${profile.documentNumber}`}
              />
              <InformationItem icon={UserRoundIcon} label="Rol" value="Alumno" />
              <InformationItem
                icon={CalendarDaysIcon}
                label="Fecha de registro"
                value={formatDate(user.registeredAt)}
              />
              <InformationItem
                icon={HashIcon}
                label="Identificador del alumno"
                value={user.userId}
              />
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5">
              <MailIcon className="size-4" aria-hidden />
              Contacto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3 sm:grid-cols-2">
              <InformationItem icon={MailIcon} label="Correo electrónico">
                <ContactLink href={`mailto:${user.email}`}>{user.email}</ContactLink>
              </InformationItem>
              <InformationItem icon={PhoneIcon} label="Teléfono">
                {profile.phoneNumber ? (
                  <ContactLink href={`tel:${profile.phoneNumber}`}>
                    {profile.phoneNumber}
                  </ContactLink>
                ) : (
                  "No indicado"
                )}
              </InformationItem>
              <InformationItem icon={ExternalLinkIcon} label="LinkedIn">
                {profile.linkedinUrl ? (
                  <ContactLink href={profile.linkedinUrl} external>
                    {profile.linkedinUrl}
                  </ContactLink>
                ) : (
                  "No indicado"
                )}
              </InformationItem>
            </dl>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-1.5">
            <TagsIcon className="size-4" aria-hidden />
            Habilidades
          </CardTitle>
        </CardHeader>
        <CardContent>
          {profile.skills.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {profile.skills.map((skill, index) => (
                <Badge
                  key={`${skill}-${index}`}
                  variant="secondary"
                  className="bg-secondary-blue text-secondary-blue-foreground"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No cargó habilidades.</p>
          )}
        </CardContent>
      </Card>

      <div className="grid items-start gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5">
              <GraduationCapIcon className="size-4" aria-hidden />
              Formación académica
            </CardTitle>
          </CardHeader>
          <CardContent>
            {education.length > 0 ? (
              <ul className="flex flex-col gap-4">
                {education.map((item, index) => (
                  <li key={item.educationId}>
                    {index > 0 && <Separator className="mb-4" />}
                    <EducationItem education={item} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                No cargó formación académica.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5">
              <BriefcaseIcon className="size-4" aria-hidden />
              Experiencia laboral
            </CardTitle>
          </CardHeader>
          <CardContent>
            {workExperience.length > 0 ? (
              <ul className="flex flex-col gap-4">
                {workExperience.map((experience, index) => (
                  <li key={experience.workExperienceId}>
                    {index > 0 && <Separator className="mb-4" />}
                    <WorkExperienceItem experience={experience} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                No cargó experiencia laboral.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href={STUDENTS_ROUTE}
      className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:rounded-sm focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <ArrowLeftIcon className="size-4" aria-hidden />
      Volver a estudiantes
    </Link>
  );
}

function InformationItem({
  icon: Icon,
  label,
  value,
  children,
}: {
  icon: LucideIcon;
  label: string;
  value?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-lg border bg-muted/20 p-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-background ring-1 ring-foreground/10">
        <Icon className="size-4 text-muted-foreground" aria-hidden />
      </div>
      <div className="min-w-0">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="break-words text-sm font-medium">{children ?? value}</dd>
      </div>
    </div>
  );
}

function ContactLink({
  href,
  external = false,
  children,
}: {
  href: string;
  external?: boolean;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className="break-all rounded-sm text-primary outline-none underline-offset-4 hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      {children}
    </a>
  );
}

function EducationItem({ education }: { education: AdminStudentEducation }) {
  const metadata = [
    DEGREE_LEVEL_LABEL[education.degreeLevel],
    education.area?.name,
    education.degree ? (education.degree.isUcu ? "UCU" : "Institución externa") : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div>
      <p className="text-sm font-medium">
        {education.degree?.name ?? "Carrera no disponible"}
      </p>
      <p className="mt-0.5 text-xs text-muted-foreground">{metadata}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">
        {formatDate(education.startDate)} –
        {education.endDate ? ` ${formatDate(education.endDate)}` : " En curso"}
      </p>
      {education.description && (
        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-muted-foreground">
          {education.description}
        </p>
      )}
    </div>
  );
}

function WorkExperienceItem({ experience }: { experience: WorkExperience }) {
  const title = [experience.position, experience.company].filter(Boolean).join(" · ");

  return (
    <div>
      <p className="text-sm font-medium">{title || "Cargo y empresa no indicados"}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">
        {formatWorkDateRange(experience)}
      </p>
      {experience.description && (
        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-muted-foreground">
          {experience.description}
        </p>
      )}
    </div>
  );
}

function StudentDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <BackLink />

      <div className="flex items-center gap-3">
        <Skeleton className="size-10 shrink-0 rounded-full" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 max-w-full" />
        </div>
      </div>

      <Skeleton className="h-24 rounded-xl" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-60 rounded-xl" />
        <Skeleton className="h-60 rounded-xl" />
      </div>
      <Skeleton className="h-28 rounded-xl" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-52 rounded-xl" />
        <Skeleton className="h-52 rounded-xl" />
      </div>
    </div>
  );
}
