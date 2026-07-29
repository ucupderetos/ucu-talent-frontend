"use client";

// Vista de perfil del alumno. Se monta desde /perfil (route group compartido
// (perfil)) cuando el rol es ALUMNO — ver app/(perfil)/perfil/page.tsx.
//
// Orquestador de "Mi perfil" (vista alumno): junta sesión + perfil y arma el
// header + las pestañas. La page.tsx solo renderiza esto.
//
// En desktop ancho (lg+) se usa el componente Tabs. Por debajo de lg no hay
// tabs: las 4 secciones (Información personal, Experiencia laboral,
// Formación académica, Habilidades) se muestran apiladas en un solo scroll
// vertical, cada una con su propio título de sección. Se usa lg (no md)
// porque con 4 tabs con ícono + texto, md se queda corto y los tabs se
// achican feo. El botón "Agregar…" de cada sección apilada se dispara desde
// acá vía ref (openCreateDialog), para poder alinearlo con el título en vez
// de dejarlo dentro del tab component.
//
// ⚠️ Se elige el layout por media query (JS), NO montando los dos y ocultando
// uno con `hidden`/`lg:hidden`. Montar ambos duplicaba el contenido en el DOM:
// `PersonalInfoTab` renderiza inputs con `id` fijos, y dos copias => IDs
// duplicados (el `htmlFor` del label apuntaba a la copia oculta); además cada
// tab lleva su propio `useState` de la lista, y dos copias se desincronizaban.
// Con `useMediaQuery` se monta un solo árbol. El contenido está detrás del
// estado de carga (skeleton), así que no hay parpadeo ni mismatch de hydration.
//
// Alcance de esta primera versión: solo lo que hoy tiene entidad confirmada
// en el MER/contrato (StudentProfile, Education, WorkExperience, skills).
// Fecha de nacimiento, país de residencia, nacionalidad, verificación de
// email/teléfono y las pestañas "Idiomas"/"Documentos"/"Preferencias" no
// tienen entidad ni endpoint todavía — quedan afuera hasta que se definan.

import { useRef } from "react";
import { BriefcaseIcon, GraduationCapIcon, PlusIcon, SparklesIcon, UserIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/layout/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useSession } from "@/hooks/use-session";
import { EducationTab, type EducationTabHandle } from "@/features/perfil/components/education-tab";
import { PersonalInfoTab } from "@/features/perfil/components/personal-info-tab";
import { SkillsTab } from "@/features/perfil/components/skills-tab";
import { StudentAccountStatusBanner } from "@/features/perfil/components/student-account-status-banner";
import { StudentProfileHeader } from "@/features/perfil/components/student-profile-header";
import {
  WorkExperienceTab,
  type WorkExperienceTabHandle,
} from "@/features/perfil/components/work-experience-tab";
import { useStudentProfile } from "@/features/perfil/hooks/use-student-profile";

export function StudentProfileView() {
  const { user, isLoading: isLoadingSession } = useSession();
  const { data, isLoading: isLoadingProfile, isError } = useStudentProfile(user?.userId);

  const isLoading = isLoadingSession || isLoadingProfile;

  const educationRef = useRef<EducationTabHandle>(null);
  const workExperienceRef = useRef<WorkExperienceTabHandle>(null);

  // `lg` de Tailwind = 1024px. Se monta un solo layout (ver el aviso de arriba).
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  return (
    <div className="flex flex-col gap-6">
      {isLoading && <ProfileSkeleton />}

      {!isLoading && (isError || !data || !user) && (
        <EmptyState
          title="No pudimos cargar tu perfil"
          description="Revisá tu conexión y volvé a intentar."
        />
      )}

      {!isLoading && data && user && (
        <div className="flex flex-col gap-6">
          <StudentAccountStatusBanner status={user.status} />

          <StudentProfileHeader profile={data.profile} user={user} />

          {/* Desktop: tabs (solo en pantallas anchas, para que no se achiquen) */}
          {isDesktop && (
            <Tabs defaultValue="personal">
              <TabsList variant="line" className="h-8 flex-wrap justify-start gap-x-6 gap-y-3 pb-0.5">
                <TabsTrigger value="personal" className="after:bg-secondary-blue">
                  <UserIcon />
                  Información personal
                </TabsTrigger>
                <TabsTrigger value="experiencia" className="after:bg-secondary-blue">
                  <BriefcaseIcon />
                  Experiencia laboral
                </TabsTrigger>
                <TabsTrigger value="formacion" className="after:bg-secondary-blue">
                  <GraduationCapIcon />
                  Formación académica
                </TabsTrigger>
                <TabsTrigger value="habilidades" className="after:bg-secondary-blue">
                  <SparklesIcon />
                  Habilidades
                </TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="mt-4">
                <PersonalInfoTab profile={data.profile} />
              </TabsContent>

              <TabsContent value="experiencia" className="mt-4">
                <WorkExperienceTab
                  studentProfileId={data.profile.studentProfileId}
                  workExperience={data.workExperience}
                />
              </TabsContent>

              <TabsContent value="formacion" className="mt-4">
                <EducationTab
                  studentProfileId={data.profile.studentProfileId}
                  education={data.education}
                />
              </TabsContent>

              <TabsContent value="habilidades" className="mt-4">
                <SkillsTab profile={data.profile} />
              </TabsContent>
            </Tabs>
          )}

          {/* Mobile / tablet: secciones apiladas, sin tabs */}
          {!isDesktop && (
            <div className="flex flex-col gap-6">
              <ProfileSection icon={UserIcon} title="Información personal">
                <PersonalInfoTab profile={data.profile} />
              </ProfileSection>

              <ProfileSection
                icon={BriefcaseIcon}
                title="Experiencia laboral"
                action={
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => workExperienceRef.current?.openCreateDialog()}
                  >
                    <PlusIcon />
                    Agregar experiencia
                  </Button>
                }
              >
                <WorkExperienceTab
                  ref={workExperienceRef}
                  studentProfileId={data.profile.studentProfileId}
                  workExperience={data.workExperience}
                  hideAddButton
                />
              </ProfileSection>

              <ProfileSection
                icon={GraduationCapIcon}
                title="Formación académica"
                action={
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => educationRef.current?.openCreateDialog()}
                  >
                    <PlusIcon />
                    Agregar formación
                  </Button>
                }
              >
                <EducationTab
                  ref={educationRef}
                  studentProfileId={data.profile.studentProfileId}
                  education={data.education}
                  hideAddButton
                />
              </ProfileSection>

              <ProfileSection icon={SparklesIcon} title="Habilidades">
                <SkillsTab profile={data.profile} />
              </ProfileSection>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ProfileSection({
  icon: Icon,
  title,
  action,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-medium text-foreground/60">
          <Icon className="size-4" />
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent className="flex items-center gap-6">
          <Skeleton className="size-16 rounded-full" />
          <div className="grid flex-1 grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}