"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { JobWizardHeader } from "@/features/puestos/components/job-wizard-header";
import { JobReview } from "@/features/puestos/components/job-review";
import { JobReviewCompanyInfo } from "@/features/puestos/components/job-review-company-info";
import { useCreateJobForm } from "@/features/puestos/hooks/use-create-job-form";
import { usePublishJob } from "@/features/puestos/hooks/use-publish-job";

export default function RevisionPage() {
  const router = useRouter();
  const { form } = useCreateJobForm();
  const { publish, isLoading, error } = usePublishJob();

  async function handlePublish() {
    const isValid = await form.trigger();
    if (!isValid) return;

    try {
      await publish(form.getValues());
      // TODO: cuando el back esté conectado, mostrar una confirmación (toast)
      // de que la oferta se publicó.
      router.push("/puestos");
    } catch {
      // publish() ya expone el error vía el estado `error` del hook
      // (useUpdateJob → mutation.isError), que se muestra más abajo en el JSX.
      // Acá solo evitamos que la excepción quede sin manejar en el submit.
    }
  }

  return (
    <>
      <JobWizardHeader currentStep={3} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <JobReview />

        <div className="flex flex-col">
          <JobReviewCompanyInfo />

          {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

          <div className="mt-auto flex flex-col gap-2 pt-4">
            <Button type="button" onClick={handlePublish} disabled={isLoading} className="h-12 w-full">
              {isLoading ? "Publicando..." : "Publicar oferta"}
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/puestos")}
                className="h-11 flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/crear-oferta/detalles-puesto")}
                className="h-11 flex-1"
              >
                Atrás
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}