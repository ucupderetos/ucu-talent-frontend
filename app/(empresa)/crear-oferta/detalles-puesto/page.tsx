"use client";

import { useRouter } from "next/navigation";
import { ArrowRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { JobWizardHeader } from "@/features/puestos/components/job-wizard-header";
import { JobDetailsForm } from "@/features/puestos/components/job-details-form";
import { useCreateJobForm } from "@/features/puestos/hooks/use-create-job-form";

export default function DetallesDelPuestoPage() {
  const router = useRouter();
  const { form, markStepReached } = useCreateJobForm();

  async function handleNext() {
    const isStepValid = await form.trigger(["description", "requirements", "salary"]);
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