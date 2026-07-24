"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { JobWizardHeader } from "@/features/puestos/components/job-wizard-header";
import { JobReview } from "@/features/puestos/components/job-review";
import { JobReviewCompanyInfo } from "@/features/puestos/components/job-review-company-info";
import { useCreateJobForm } from "@/features/puestos/hooks/use-create-job-form";
import { usePublishJob } from "@/features/puestos/hooks/use-publish-job";

export default function RevisionPage() {
  const router = useRouter();
  const { form } = useCreateJobForm();
  const { publish, isLoading } = usePublishJob();

  async function handlePublish() {
    const isValid = await form.trigger();
    if (!isValid) return;

    try {
      await publish(form.getValues());
      toast.success("Oferta publicada.");
      router.push("/puestos");
    } catch (err) {
      // publish() puede lanzar de forma síncrona (ej. no se resolvió la empresa
      // logueada) ANTES de correr la mutación, así que ese error no queda en el
      // estado de `usePublishJob` — lo surfaceamos acá para no fallar en
      // silencio. Los errores de la mutación (ApiError de POST /vacancy) también
      // caen acá con su mensaje real.
      toast.error(err instanceof Error ? err.message : "No se pudo publicar la oferta.");
    }
  }

  return (
    <>
      <JobWizardHeader currentStep={3} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <JobReview />

        <div className="flex flex-col">
          <JobReviewCompanyInfo />

          <div className="mt-auto flex flex-col gap-2 pt-4">
            <Button
              type="button"
              onClick={handlePublish}
              disabled={isLoading}
              className="h-12 w-full bg-ucu-blue text-white hover:bg-ucu-blue/90"
            >
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