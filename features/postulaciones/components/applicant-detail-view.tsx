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
// es el que ya sugiere `docs/agents/design-system.md` para el detalle de un
// ítem anidado (breadcrumb "Sección > Nombre del ítem").
//
// Al montarse (postulante PENDIENTE) dispara la transición automática a
// VISTO — es la empresa "abriendo el perfil del postulante", que es
// justamente el disparador real de esa transición (ver
// `docs/agents/applications-state-machine.md`).
//
// Deliberadamente NO incluye: notas internas, historial de estados, ni
// ubicación/experiencia/disponibilidad resumidas — ninguno de esos campos
// existe hoy en el contrato (`StudentProfile`/`VacancyApplication`, ver
// types/index.ts). Sí muestra educación y experiencia laboral: esas son
// entidades reales del MER (`Education`/`WorkExperience`) que la empresa puede
// ver, y desde 2026-07-30 también la foto de perfil y el **CV adjunto**
// (`StudentProfile.cvFile`), que sí existen en el contrato.

import { useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  BriefcaseIcon,
  ExternalLinkIcon,
  FileTextIcon,
  GraduationCapIcon,
  MailIcon,
  PhoneIcon,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/layout/empty-state";
import { usePageBreadcrumb } from "@/components/layout/breadcrumb-context";
import { useCurrentCompany } from "@/hooks/use-current-company";
import { useCvUrl } from "@/hooks/use-cv";
import { useSignedProfileImageUrl } from "@/hooks/use-profile-image";
import { ApplicationStatusBadge } from "@/components/vacancies/application-status-badge";
import { useApplicantDetail } from "@/features/postulaciones/hooks/use-applicant-detail";
import { useMarkApplicantViewed } from "@/features/postulaciones/hooks/use-mark-applicant-viewed";
import { initialsFrom } from "@/lib/avatar";
import { DEGREE_LEVEL_LABELS } from "@/lib/degree-levels";

const dateFormatter = new Intl.DateTimeFormat("es-UY", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function formatDate(iso: string | null): string {
  return iso ? dateFormatter.format(new Date(iso)) : "Actualidad";
}

/**
 * Acceso al CV adjunto del postulante. Los tres estados que NO son "acá está el
 * link" se muestran como texto, no como un botón deshabilitado: un botón que no
 * hace nada obliga a adivinar por qué.
 *
 * `detail.profile` ya es el `StudentProfile` completo, así que la key del CV
 * viene incluida — lo único que falta es canjearla por la URL firmada.
 */
function CvAction({ cvFile }: { cvFile: string | null }) {
  const { cvUrl, isLoading, isUnavailable } = useCvUrl(cvFile);

  if (!cvFile) {
    return <p className="text-sm text-muted-foreground">No adjuntó CV</p>;
  }

  if (isLoading) {
    return <Skeleton className="h-8 w-28 rounded-lg" />;
  }

  // Hay CV subido pero el backend no puede firmar su URL (`503`: el storage del
  // entorno no está configurado — ver el aviso en `hooks/use-cv.ts`). Sin este
  // texto la pantalla se ve igual que la de un postulante que no adjuntó nada.
  if (isUnavailable || !cvUrl) {
    return <p className="text-sm text-muted-foreground">CV no disponible en este momento</p>;
  }

  return (
    // Es el CTA principal de la pantalla para quien está revisando postulantes,
    // así que va con el color de marca escrito literal (`bg-ucu-blue`, no el
    // token `bg-primary`) y con el alto de un CTA suelto en contenido (`h-10
    // px-6`) — las dos cosas, tal como las pide AGENTS.md.
    <Button
      asChild
      type="button"
      className="h-10 bg-ucu-blue px-6 text-white hover:bg-ucu-blue/90"
    >
      {/* `rel` obligatorio con target="_blank": la URL firmada es de GCS, un
          origen ajeno. */}
      <a href={cvUrl} target="_blank" rel="noopener noreferrer">
        <FileTextIcon />
        Ver CV
      </a>
    </Button>
  );
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
  // El detalle ya trae el `User` del alumno (lo pide para el email), así que la
  // key de su imagen viene incluida: solo falta canjearla por la URL firmada.
  const { imageUrl } = useSignedProfileImageUrl(detail?.user.profileImage);

  const status = detail?.application.status;

  useEffect(() => {
    // `status` tiene que estar en las deps: en un link directo/refresh el
    // detalle todavía no cargó cuando este efecto corre por primera vez
    // (`status` es `undefined`), así que hace falta que vuelva a correr
    // cuando `useApplicantDetail` resuelve y `status` pasa a "PENDIENTE".
    // Repetir la mutación no es un problema: este efecto solo llama a
    // `markViewed` mientras `status` siga siendo "PENDIENTE"; una vez que la
    // mutación resuelve y el detalle se refresca a "VISTO", no vuelve a
    // disparar nada.
    if (status === "PENDIENTE") {
      markViewed(vacancyApplicationId);
    }
  }, [vacancyApplicationId, status, markViewed]);

  const isLoading = isLoadingCompany || isLoadingDetail;

  // Alimenta el breadcrumb del Navbar ("Postulantes › Nombre Apellido"):
  // undefined mientras carga (muestra Skeleton), null si no se encontró el
  // postulante (el Navbar deja solo la sección, sin Skeleton colgado).
  usePageBreadcrumb(
    isLoading ? undefined : detail ? `${detail.profile.name} ${detail.profile.surname}` : null,
  );

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

      <div className="flex flex-wrap items-center gap-3">
        <Avatar size="lg">
          {imageUrl && <AvatarImage src={imageUrl} alt="" />}
          <AvatarFallback>{initialsFrom(detail.profile.name, detail.profile.surname)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-semibold tracking-tight">
            {detail.profile.name} {detail.profile.surname}
          </h1>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <MailIcon className="size-3.5 shrink-0" aria-hidden />
            <span className="truncate">{detail.user.email}</span>
          </p>
        </div>

        {/* El CV va acá arriba, no en una card más abajo: para quien está
            revisando postulantes es la acción principal de la pantalla. */}
        <CvAction cvFile={detail.profile.cvFile} />
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
              <ApplicationStatusBadge status={detail.application.status} />
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
                    <p className="text-sm font-medium">{DEGREE_LEVEL_LABELS[education.degreeLevel as keyof typeof DEGREE_LEVEL_LABELS]}</p>
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
