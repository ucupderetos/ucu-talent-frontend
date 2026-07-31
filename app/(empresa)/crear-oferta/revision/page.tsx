"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api-client";
import { applyFieldErrors } from "@/lib/form-errors";
import { JobWizardHeader } from "@/features/puestos/components/job-wizard-header";
import { JobReview } from "@/features/puestos/components/job-review";
import { JobReviewCompanyInfo } from "@/features/puestos/components/job-review-company-info";
import { useCreateJobForm } from "@/features/puestos/hooks/use-create-job-form";
import { usePublishJob } from "@/features/puestos/hooks/use-publish-job";

// A qué paso del wizard pertenece cada campo — para mandar de vuelta a la
// empresa al paso correcto cuando un error aparece recién al publicar (paso 3,
// que es solo un resumen de lectura, `JobReview`: no tiene inputs propios
// donde mostrar el error). Se usa para los dos orígenes de error: el 400 por
// campo del backend (A-19) y la validación local de Zod.
//
// ⚠️ Entre los dos sets tienen que estar TODOS los campos del form. Si falta
// alguno, un error en ese campo deja al usuario en revisión sin ver dónde está
// el problema.
const STEP_1_FIELDS = new Set([
  "name",
  "areaId",
  "contractType",
  "modality",
  "location",
  "publicationDate",
  "closingDate",
]);
// "salary" queda incluido aunque el form ya no tenga ese campo (está partido
// en salaryCurrency/salaryMin/salaryMax): el backend sigue devolviendo el
// error bajo esa key, y solo se usa acá para decidir a qué paso navegar —
// `applyFieldErrors` ya cubre el caso de un campo que el form no puede pegar a
// un control 1 a 1 (cae en `unmapped`, mostrado por el toast).
const STEP_2_FIELDS = new Set([
  "description",
  "requirements",
  "salary",
  "salaryCurrency",
  "salaryMin",
  "salaryMax",
]);

export default function RevisionPage() {
  const router = useRouter();
  const { form, furthestStep } = useCreateJobForm();
  const { publish, isLoading } = usePublishJob();

  // Red de contención para URL directa (ver mismo guard en detalles-puesto):
  // sin haber pasado por los pasos 1 y 2 no hay datos que revisar.
  useEffect(() => {
    if (furthestStep < 3) {
      router.replace(
        furthestStep < 2 ? "/crear-oferta/informacion-basica" : "/crear-oferta/detalles-puesto",
      );
    }
  }, [furthestStep, router]);

  if (furthestStep < 3) return null;

  async function handlePublish() {
    const isValid = await form.trigger();
    if (!isValid) {
      // Los pasos 1 y 2 ya validan lo suyo al pasar de pantalla, así que llegar
      // acá con errores es raro — pero pasa si el usuario vuelve atrás y rompe
      // un campo, o si una regla depende de "hoy" y la pestaña cruzó la
      // medianoche. Sin este feedback el botón simplemente no hace nada.
      toast.error("Revisá los campos marcados antes de publicar.");
      navigateToFirstStepWithError(Object.keys(form.formState.errors));
      return;
    }

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
   *  `formState`) y navega al paso donde está el campo. */
  function applyFieldErrorsAndNavigate(fieldErrors: Record<string, string>) {
    // `known` = los campos que el form realmente tiene, para pegar cada mensaje
    // a su control (los que no, quedan en `unmapped`, cubiertos por el toast).
    const known = new Set(Object.keys(form.getValues()));
    applyFieldErrors(fieldErrors, form.setError, known);
    navigateToFirstStepWithError(Object.keys(fieldErrors));
  }

  /** Navega al paso más temprano que contenga alguno de estos campos, para que
   *  la empresa vea el error sin tener que adivinar dónde buscarlo. Si ninguno
   *  mapea a un paso, se queda acá y el toast es todo el feedback. */
  function navigateToFirstStepWithError(fields: string[]) {
    let targetStep: 1 | 2 | null = null;
    for (const field of fields) {
      if (STEP_1_FIELDS.has(field)) {
        targetStep = 1;
        break; // el paso 1 es el más temprano, no hay nada mejor que buscar
      }
      if (STEP_2_FIELDS.has(field)) targetStep = 2;
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