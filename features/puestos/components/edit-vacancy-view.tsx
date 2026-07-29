"use client";

// Orquestador de "Editar oferta" (vista empresa): junta la vacante
// (features/puestos) con la sesión (features/auth) para el gate de
// "sos la empresa dueña", y arma la mutación real de PUT /vacancy/{id}.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { usePageBreadcrumb } from "@/components/layout/breadcrumb-context";
import { EmptyState } from "@/components/layout/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api-client";
import { useSession } from "@/hooks/use-session";
import { EditJobForm } from "@/features/puestos/components/edit-job-form";
import { useEditJob } from "@/features/puestos/hooks/use-edit-job";
import { useVacancy, useVacancyApplicantsCount } from "@/features/puestos/hooks/use-vacancy";
import type { VacancyUpdateInput } from "@/features/puestos/types";

export function EditVacancyView({ vacancyId }: { vacancyId: string }) {
  const router = useRouter();
  const { user, isLoading: isLoadingSession } = useSession();
  const { data: vacancy, isLoading: isLoadingVacancy, isError } = useVacancy(vacancyId);
  const { edit, isLoading: isSaving } = useEditJob(vacancyId);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string> | null>(null);

  usePageBreadcrumb(isLoadingVacancy ? undefined : (vacancy?.name ?? null));

  // Chequeo de UX, no de seguridad (AGENTS.md): el backend ya rechaza el PUT
  // si no sos la empresa dueña, esto solo evita mostrar un form que va a
  // fallar apenas se guarde.
  const isOwner = Boolean(user && vacancy && user.userId === vacancy.companyId);

  // Solo se pide una vez confirmado el ownership: el endpoint es "Empresa
  // dueña" (docs/ENDPOINTS.md), pedirlo antes solo generaría un 403 de más.
  const {
    count: applicantsCount,
    isLoading: isLoadingApplicants,
    isError: isApplicantsError,
  } = useVacancyApplicantsCount(vacancyId, isOwner);

  const isLoading = isLoadingSession || isLoadingVacancy || (isOwner && isLoadingApplicants);

  async function handleSubmit(values: VacancyUpdateInput) {
    setFieldErrors(null);
    try {
      await edit(values);
      toast.success("Oferta actualizada.");
      router.push("/puestos");
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors) {
        setFieldErrors(err.fieldErrors);
      }
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

  // Terminal (RF-PUE-03): una vez cerrada la búsqueda no tiene sentido seguir
  // ajustando sus datos. La tabla de "Mis ofertas" ya oculta el link de
  // "Editar" en este estado (vacancy-table.tsx); este chequeo cubre a quien
  // entra por URL directa.
  if (vacancy.status === "FINALIZADO") {
    return (
      <EmptyState
        title="Esta oferta ya no se puede editar"
        description="La oferta está finalizada: el cierre de una búsqueda es definitivo."
      />
    );
  }

  // El gate de A-06 depende de saber CUÁNTOS postulantes tiene la oferta: un
  // conteo desconocido (falló el fetch) no puede tratarse como "0 postulantes"
  // — se arriesgaría a dejar editar datos de una oferta que en realidad ya
  // tiene gente postulada. Se bloquea del todo y se ofrece reintentar.
  if (isApplicantsError) {
    return (
      <EmptyState
        title="No pudimos confirmar los postulantes de esta oferta"
        description="Para no arriesgarnos a modificar los datos de una oferta con postulantes, la edición queda bloqueada hasta que se pueda confirmar. Recargá la página para reintentar."
      />
    );
  }

  return (
    <EditJobForm
      vacancy={vacancy}
      onSubmit={handleSubmit}
      isSubmitting={isSaving}
      onCancel={() => router.push("/puestos")}
      isLocked={applicantsCount >= 1}
      applicantsCount={applicantsCount}
      apiFieldErrors={fieldErrors}
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
