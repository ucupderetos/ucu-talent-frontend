"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ArrowRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { JobWizardHeader } from "@/features/puestos/components/job-wizard-header";
import { JobDetailsForm } from "@/features/puestos/components/job-details-form";
import { useCreateJobForm } from "@/features/puestos/hooks/use-create-job-form";

export default function DetallesDelPuestoPage() {
  const router = useRouter();
  const { form, furthestStep, markStepReached } = useCreateJobForm();

  // Red de contención para URL directa: si todavía no se completó (ni
  // validó) el paso 1, `router.push` no alcanza a este punto vía la UI
  // normal, así que solo puede pasar tipeando la URL — se manda de vuelta
  // al paso 1 en vez de mostrar este paso con datos vacíos.
  useEffect(() => {
    if (furthestStep < 2) router.replace("/crear-oferta/informacion-basica");
  }, [furthestStep, router]);

  if (furthestStep < 2) return null;

  async function handleNext() {
    const isStepValid = await form.trigger([
      "description",
      "requirements",
      "salaryCurrency",
      "salaryMin",
      "salaryMax",
    ]);
    if (isStepValid) {
      markStepReached(3);
      router.push("/crear-oferta/revision");
    }
  }

  return (
    <>
      <JobWizardHeader currentStep={2} />

      <JobDetailsForm />

      <div className="mt-6 flex justify-end gap-3">
        <Button type="button" variant="outline" className="h-11" onClick={() => router.push("/puestos")}>
          Cancelar
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-11"
          onClick={() => router.push("/crear-oferta/informacion-basica")}
        >
          Atrás
        </Button>
        <Button type="button" onClick={handleNext} className="h-11 gap-2">
          Siguiente: Revisión
          <ArrowRightIcon className="size-4" />
        </Button>
      </div>
    </>
  );
}