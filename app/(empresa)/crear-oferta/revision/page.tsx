"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api-client";
import { applyFieldErrors } from "@/lib/form-errors";
import { JobWizardHeader } from "@/features/puestos/components/job-wizard-header";
import { JobReview } from "@/features/puestos/components/job-review";
import { JobReviewCompanyInfo } from "@/features/puestos/components/job-review-company-info";
import { useCreateJobForm } from "@/features/puestos/hooks/use-create-job-form";
import { usePublishJob } from "@/features/puestos/hooks/use-publish-job";

// A qué paso del wizard pertenece cada campo — para poder mandar de vuelta a
// la empresa al paso correcto si el backend devuelve un error de validación
// por campo (A-19) recién al publicar (paso 3, que es solo un resumen de
// lectura, `JobReview`: no tiene inputs propios donde mostrar el error).
const STEP_1_FIELDS = new Set(["name", "areaId", "contractType", "modality", "location"]);
// "salary" queda incluido aunque el form ya no tenga ese campo (está
// partido en salaryCurrency/salaryMin/salaryMax): el backend sigue
// devolviendo el error bajo esa key, y solo se usa acá para decidir a qué
// paso navegar — `applyFieldErrorsAndNavigate` ya cubre el caso de un campo
// que el form no puede pegar a un control 1 a 1 (cae en `unmapped`, mostrado
// por el toast).
const STEP_2_FIELDS = new Set(["description", "requirements", "salary"]);

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
      if (err instanceof ApiError && err.fieldErrors) {
        applyFieldErrorsAndNavigate(err.fieldErrors);
      }
      toast.error(err instanceof Error ? err.message : "No se pudo publicar la oferta.");
    }
  }

  /** Mapea `{ campo: mensaje }` (A-19) al form compartido del wizard
   *  (`setError` — el mismo objeto de errores que leen los steps 1 y 2 vía
   *  `formState`) y navega al paso más temprano que tenga un error, para que
   *  la empresa lo vea sin tener que adivinar dónde buscarlo. */
  function applyFieldErrorsAndNavigate(fieldErrors: Record<string, string>) {
    // `known` = los campos que el form realmente tiene, para pegar cada mensaje
    // a su control (los que no, quedan en `unmapped`, cubiertos por el toast).
    const known = new Set(Object.keys(form.getValues()));
    applyFieldErrors(fieldErrors, form.setError, known);

    let targetStep: 1 | 2 | null = null;
    for (const field of Object.keys(fieldErrors)) {
      if (STEP_1_FIELDS.has(field)) {
        targetStep = 1;
      } else if (STEP_2_FIELDS.has(field) && targetStep !== 1) {
        targetStep = 2;
      }
    }

    if (targetStep === 1) {
      router.push("/crear-oferta/informacion-basica");
    } else if (targetStep === 2) {
      router.push("/crear-oferta/detalles-puesto");
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