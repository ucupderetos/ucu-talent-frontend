"use client";

// Orquestador de "Mis postulaciones" (vista alumno): junta sesión +
// postulaciones y arma la grilla de cards. La page.tsx solo renderiza esto.

import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/features/auth/hooks/use-session";
import { ApplicationCard } from "@/features/postulaciones/components/application-card";
import { useMyApplications } from "@/features/postulaciones/hooks/use-my-applications";

export function MyApplicationsView() {
  const { user, isLoading: isLoadingSession } = useSession();
  const { data, isLoading: isLoadingApplications, isError } = useMyApplications(user?.userId);

  const isLoading = isLoadingSession || isLoadingApplications;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Mis postulaciones"
        description="Seguí el estado de las vacantes a las que te postulaste."
      />

      {isLoading && <GridSkeleton />}

      {!isLoading && isError && (
        <EmptyState
          title="No pudimos cargar tus postulaciones"
          description="Revisá tu conexión y volvé a intentar."
        />
      )}

      {!isLoading && !isError && data && data.length === 0 && (
        <EmptyState
          title="Todavía no te postulaste a ninguna vacante"
          description="Explorá el feed y postulate a las que te interesen."
        />
      )}

      {!isLoading && !isError && data && data.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((row) => (
            <ApplicationCard key={row.application.vacancyApplicationId} row={row} />
          ))}
        </div>
      )}
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-56 rounded-xl" />
      ))}
    </div>
  );
}
