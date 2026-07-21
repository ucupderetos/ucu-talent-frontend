"use client";

import { useRouter } from "next/navigation";
import { ArrowRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { JobWizardHeader } from "@/features/crear-oferta/components/JobWizardHeader";
import { JobDetailsForm } from "@/features/crear-oferta/components/JobDetailsForm";
import { useCreateJobForm } from "@/features/crear-oferta/hooks/use-create-job-form";

export default function DetallesDelPuestoPage() {
    const router = useRouter();
    const form = useCreateJobForm();

    function handleSaveDraft() {
        // TODO: sin endpoint de borradores en el back todavía.
        console.log("TODO: guardar borrador", form.getValues());
    }

    async function handleNext() {
        const isStepValid = await form.trigger(["description"]);
        if (isStepValid) {
            router.push("/crear-oferta/revision");
        }
    }

    return (
        <>
            <JobWizardHeader currentStep={2} />

            <JobDetailsForm />

            <div className="mt-6 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={handleSaveDraft}>
                    Guardar borrador
                </Button>
                <Button type="button" onClick={handleNext} className="gap-2">
                    Siguiente: Revisión
                    <ArrowRightIcon className="size-4" />
                </Button>
            </div>
        </>
    );
}