"use client";

// Página de detalle de un postulante ("CV" que ve la empresa), ruta
// /postulantes/[id]. Se llega acá haciendo click en un postulante desde
// applicant-table.tsx.
//
// Por qué página propia y no panel lateral ni modal: esta app se usa también
// desde el celular, y tanto el Sheet (desliza de costado) como el Dialog
// (popup centrado) son overlays flotantes — en una pantalla chica compiten
// con el contenido y no dejan mucho margen para un CV completo (educación +
// experiencia). Una página propia es el mismo patrón en mobile y desktop, y
// es el que ya sugiere AGENTS.md para el detalle de un ítem anidado
// (breadcrumb "Sección > Nombre del ítem").
//
// Al montarse (postulante PENDIENTE) dispara la transición automática a
// VISTO — es la empresa "abriendo el perfil del postulante", que es
// justamente el disparador real de esa transición (ver AGENTS.md).
//
// Deliberadamente NO incluye: notas internas, historial de estados, foto de
// perfil, ubicación/experiencia/disponibilidad resumidas ni botón de
// descargar CV — ninguno de esos campos existe hoy en el contrato
// (`StudentProfile`/`VacancyApplication`, ver types/index.ts). Sí muestra
// educación y experiencia laboral: esas son entidades reales del MER
// (`Education`/`WorkExperience`) que la empresa puede ver.

import { useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  BriefcaseIcon,
  ExternalLinkIcon,
  GraduationCapIcon,
  MailIcon,
  PhoneIcon,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/layout/empty-state";
import { useCurrentCompany } from "@/features/auth/hooks/use-current-company";
import { ApplicantStatusBadge } from "@/features/postulaciones/components/applicant-status-badge";
import { useApplicantDetail } from "@/features/postulaciones/hooks/use-applicant-detail";
import { useMarkApplicantViewed } from "@/features/postulaciones/hooks/use-mark-applicant-viewed";

const dateFormatter = new Intl.DateTimeFormat("es-UY", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const DEGREE_LEVEL_LABEL: Record<string, string> = {
  TECNICATURA: "Tecnicatura",
  LICENCIATURA: "Licenciatura",
  GRADO: "Grado",
  POSGRADO: "Posgrado",
  DOCTORADO: "Doctorado",
};

function formatDate(iso: string | null): string {
  return iso ? dateFormatter.format(new Date(iso)) : "Actualidad";
}

function initials(name: string, surname: string): string {
  return `${name.charAt(0)}${surname.charAt(0)}`.toUpperCase();
}

function BackLink() {
  return (
    <Link
      href="/postulantes"
      className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
    >
      <ArrowLeftIcon className="size-4" aria-hidden />
      Postulantes
    </Link>
  );
}

export function ApplicantDetailView({ vacancyApplicationId }: { vacancyApplicationId: string }) {
  const { company, isLoading: isLoadingCompany } = useCurrentCompany();
  const { data: detail, isLoading: isLoadingDetail } = useApplicantDetail(
    company?.companyId,
    vacancyApplicationId,
  );
  const { mutate: markViewed } = useMarkApplicantViewed();

  const status = detail?.application.status;

  useEffect(() => {
    if (vacancyApplicationId && status === "PENDIENTE") {
      markViewed(vacancyApplicationId);
    }
    // Solo al llegar a un postulante nuevo: no queremos re-disparar la
    // mutación en cada render, así que `markViewed`/`status` quedan fuera.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vacancyApplicationId]);

  const isLoading = isLoadingCompany || isLoadingDetail;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <BackLink />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="flex flex-col gap-6">
        <BackLink />
        <EmptyState
          title="No encontramos este postulante"
          description="Puede que ya no tengas acceso o que el link esté roto."
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <BackLink />

      <div className="flex items-center gap-3">
        <Avatar size="lg">
          <AvatarFallback>{initials(detail.profile.name, detail.profile.surname)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold tracking-tight">
            {detail.profile.name} {detail.profile.surname}
          </h1>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <MailIcon className="size-3.5 shrink-0" aria-hidden />
            <span className="truncate">{detail.user.email}</span>
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex flex-col gap-1.5">
            <p className="text-sm font-medium">Postulación</p>
            <p className="text-sm text-muted-foreground">{detail.vacancyName}</p>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Postulado el {formatDate(detail.application.appliedAt)}
              </span>
              <ApplicantStatusBadge status={detail.application.status} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-2">
            <p className="text-sm font-medium">Contacto</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <PhoneIcon className="size-4 shrink-0" aria-hidden />
              {detail.profile.phoneNumber ?? "No indica teléfono"}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ExternalLinkIcon className="size-4 shrink-0" aria-hidden />
              {detail.profile.linkedinUrl ? (
                <a
                  href={detail.profile.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="truncate text-primary hover:underline"
                >
                  {detail.profile.linkedinUrl}
                </a>
              ) : (
                "No indica LinkedIn"
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-2">
          <p className="text-sm font-medium">Habilidades</p>
          {detail.profile.skills.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {detail.profile.skills.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No indica habilidades.</p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex flex-col gap-2">
            <p className="flex items-center gap-1.5 text-sm font-medium">
              <GraduationCapIcon className="size-4" aria-hidden />
              Educación
            </p>
            {detail.education.length > 0 ? (
              <ul className="flex flex-col gap-3">
                {detail.education.map((education, index) => (
                  <li key={education.educationId}>
                    {index > 0 && <Separator className="mb-3" />}
                    <p className="text-sm font-medium">{DEGREE_LEVEL_LABEL[education.degreeLevel]}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(education.startDate)} – {formatDate(education.endDate)}
                    </p>
                    {education.description && (
                      <p className="mt-0.5 text-xs text-muted-foreground">{education.description}</p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No cargó educación.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-2">
            <p className="flex items-center gap-1.5 text-sm font-medium">
              <BriefcaseIcon className="size-4" aria-hidden />
              Experiencia laboral
            </p>
            {detail.workExperience.length > 0 ? (
              <ul className="flex flex-col gap-3">
                {detail.workExperience.map((experience, index) => (
                  <li key={experience.workExperienceId}>
                    {index > 0 && <Separator className="mb-3" />}
                    <p className="text-sm font-medium">
                      {experience.position ?? "—"}
                      {experience.company && ` · ${experience.company}`}
                    </p>
                    {experience.startDate && (
                      <p className="text-xs text-muted-foreground">
                        {formatDate(experience.startDate)} – {formatDate(experience.endDate)}
                      </p>
                    )}
                    {experience.description && (
                      <p className="mt-0.5 text-xs text-muted-foreground">{experience.description}</p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No cargó experiencia laboral.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
