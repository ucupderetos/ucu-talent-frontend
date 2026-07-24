"use client";

// Vista de perfil del alumno. Se monta desde /perfil (route group compartido
// (perfil)) cuando el rol es ALUMNO — ver app/(perfil)/perfil/page.tsx.
//
// Orquestador de "Mi perfil" (vista alumno): junta sesión + perfil y arma el
// header + las pestañas. La page.tsx solo renderiza esto.
//
// Alcance de esta primera versión: solo lo que hoy tiene entidad confirmada
// en el MER/contrato (StudentProfile, Education, WorkExperience, skills).
// Fecha de nacimiento, país de residencia, nacionalidad, verificación de
// email/teléfono y las pestañas "Idiomas"/"Documentos"/"Preferencias" no
// tienen entidad ni endpoint todavía — quedan afuera hasta que se definan.

import { BriefcaseIcon, GraduationCapIcon, SparklesIcon, UserIcon } from "lucide-react";

import { EmptyState } from "@/components/layout/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "@/features/auth/hooks/use-session";
import { EducationTab } from "@/features/perfil/components/education-tab";
import { PersonalInfoTab } from "@/features/perfil/components/personal-info-tab";
import { SkillsTab } from "@/features/perfil/components/skills-tab";
import { StudentProfileHeader } from "@/features/perfil/components/student-profile-header";
import { WorkExperienceTab } from "@/features/perfil/components/work-experience-tab";
import { useStudentProfile } from "@/features/perfil/hooks/use-student-profile";

export function StudentProfileView() {
  const { user, isLoading: isLoadingSession } = useSession();
  const { data, isLoading: isLoadingProfile, isError } = useStudentProfile(user?.userId);

  const isLoading = isLoadingSession || isLoadingProfile;

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
          <StudentProfileHeader profile={data.profile} user={user} />

          <Tabs defaultValue="personal">
            <TabsList variant="line">
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

            <TabsContent value="experiencia">
              <WorkExperienceTab
                studentProfileId={data.profile.studentProfileId}
                workExperience={data.workExperience}
              />
            </TabsContent>

            <TabsContent value="formacion">
              <EducationTab
                studentProfileId={data.profile.studentProfileId}
                education={data.education}
              />
            </TabsContent>

            <TabsContent value="habilidades" className="mt-4">
              <SkillsTab skills={data.profile.skills} />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
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
