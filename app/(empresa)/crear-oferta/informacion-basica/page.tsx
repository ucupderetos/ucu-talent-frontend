"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "lucide-react";

import { JobWizardHeader } from "@/features/crear-oferta/components/JobWizardHeader";
import { JobBasicInfoForm } from "@/features/crear-oferta/components/JobBasicInfoForm";
import { useCreateJobForm } from "@/features/crear-oferta/hooks/use-create-job-form";

export default function InformacionBasicaPage() {
  const router = useRouter();
  const form = useCreateJobForm();

  function handleSaveDraft() {
    // TODO: sin endpoint de borradores en el back todavía.
    console.log("TODO: guardar borrador", form.getValues());
  }

  async function handleNext() {
    const isStepValid = await form.trigger([
      "name",
      "areaId",
      "contractType",
      "modality",
      "location",
    ]);
    if (isStepValid) {
      router.push("/crear-oferta/detalles-puesto");
    }
  }

  return (
    <>
      <JobWizardHeader currentStep={1} />

      <JobBasicInfoForm />

      <div className="mt-6 flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={handleSaveDraft}>
          Guardar borrador
        </Button>
        <Button type="button" onClick={handleNext} className="gap-2">
          Siguiente: Detalles del puesto
          <ArrowRightIcon className="size-4" />
        </Button>
      </div>
    </>
  );
}