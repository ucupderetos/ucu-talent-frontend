"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "lucide-react";

import { JobWizardHeader } from "@/features/puestos/components/job-wizard-header";
import { JobBasicInfoForm } from "@/features/puestos/components/job-basic-info-form";
import { useCreateJobForm } from "@/features/puestos/hooks/use-create-job-form";

export default function InformacionBasicaPage() {
  const router = useRouter();

  const { form, markStepReached } = useCreateJobForm();

  async function handleNext() {
    // La lista tiene que cubrir TODOS los campos que renderiza este paso —
    // `publicationDate`/`closingDate` incluidas (viven en `JobBasicInfoForm`).
    // Si falta alguno, su error recién aparece en el `form.trigger()` completo
    // de `revision`, que es una pantalla de solo lectura sin ese input: el
    // botón "Publicar" queda muerto sin explicación.
    const isStepValid = await form.trigger([
      "name", "areaId", "contractType", "modality", "location",
      "publicationDate", "closingDate",
    ]);
    if (isStepValid) {
      markStepReached(2);
      router.push("/crear-oferta/detalles-puesto");
    }
  }

  return (
    <>
      <JobWizardHeader currentStep={1} />

      <JobBasicInfoForm />

      <div className="mt-6 flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.push("/puestos")}>
          Cancelar
        </Button>
        <Button type="button" onClick={handleNext} className="gap-2">
          Siguiente: Detalles del puesto
          <ArrowRightIcon className="size-4" />
        </Button>
      </div>
    </>
  );
}