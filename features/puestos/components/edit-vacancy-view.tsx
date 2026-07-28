"use client";

// Orquestador de "Editar oferta" (vista empresa): junta la vacante
// (features/puestos) con la sesión (features/auth) para el gate de
// "sos la empresa dueña", y arma la mutación real de PUT /vacancy/{id}.

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { usePageBreadcrumb } from "@/components/layout/breadcrumb-context";
import { EmptyState } from "@/components/layout/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/hooks/use-session";
import { EditJobForm } from "@/features/puestos/components/edit-job-form";
import { useEditJob } from "@/features/puestos/hooks/use-edit-job";
import { useVacancy } from "@/features/puestos/hooks/use-vacancy";
import type { VacancyUpdateInput } from "@/features/puestos/types";

export function EditVacancyView({ vacancyId }: { vacancyId: string }) {
  const router = useRouter();
  const { user, isLoading: isLoadingSession } = useSession();
  const { data: vacancy, isLoading: isLoadingVacancy, isError } = useVacancy(vacancyId);
  const { edit, isLoading: isSaving } = useEditJob(vacancyId);

  usePageBreadcrumb(isLoadingVacancy ? undefined : (vacancy?.name ?? null));

  const isLoading = isLoadingSession || isLoadingVacancy;
  // Chequeo de UX, no de seguridad (AGENTS.md): el backend ya rechaza el PUT
  // si no sos la empresa dueña, esto solo evita mostrar un form que va a
  // fallar apenas se guarde.
  const isOwner = Boolean(user && vacancy && user.userId === vacancy.companyId);

  async function handleSubmit(values: VacancyUpdateInput) {
    try {
      await edit(values);
      toast.success("Oferta actualizada.");
      router.push("/puestos");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudieron guardar los cambios.");
    }
  }

  if (isLoading) return <EditVacancySkeleton />;

  if (isError || !vacancy) {
    return (
      <EmptyState
        title="No encontramos esta oferta"
        description="Puede que haya sido eliminada o que el link esté mal escrito."
      />
    );
  }

  if (!isOwner) {
    return (
      <EmptyState
        title="No podés editar esta oferta"
        description="Esta oferta pertenece a otra empresa."
      />
    );
  }

  return (
    <EditJobForm
      vacancy={vacancy}
      onSubmit={handleSubmit}
      isSubmitting={isSaving}
      onCancel={() => router.push("/puestos")}
    />
  );
}

function EditVacancySkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-72 w-full rounded-xl" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}
