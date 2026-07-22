"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { JobWizardHeader } from "@/features/crear-oferta/components/JobWizardHeader";
import { JobReview } from "@/features/crear-oferta/components/JobReview";
import { JobReviewCompanyInfo } from "@/features/crear-oferta/components/JobReviewCompanyInfo";
import { useCreateJobForm } from "@/features/crear-oferta/hooks/use-create-job-form";
import { usePublishJob } from "@/features/crear-oferta/hooks/use-publish-job";

export default function RevisionPage() {
  const router = useRouter();
  const { form } = useCreateJobForm();
  const { publish, isLoading, error } = usePublishJob();

  async function handlePublish() {
    const isValid = await form.trigger();
    if (!isValid) return;

    await publish(form.getValues());
    // TODO: cuando el back esté conectado, redirigir a "Mis ofertas" (/puestos)
    // y mostrar una confirmación (toast) de que la oferta se publicó.
    router.push("/puestos");
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
            <Button type="button" onClick={handlePublish} disabled={isLoading} className="w-full">
              {isLoading ? "Publicando..." : "Publicar oferta"}
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/puestos")}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/crear-oferta/detalles-puesto")}
                className="flex-1"
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