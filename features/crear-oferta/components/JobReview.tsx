"use client";

import { useWatch } from "react-hook-form";
import { MapPinIcon, BriefcaseIcon, CalendarIcon, FileTextIcon, BuildingIcon } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { useCreateJobForm } from "@/features/crear-oferta/hooks/use-create-job-form";
import { DEPARTMENT_LABELS } from "@/features/crear-oferta/types";

const CONTRACT_TYPE_LABELS: Record<string, string> = {
  PASANTIA: "Pasantía",
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  ZAFRAL: "Zafral",
};

export function JobReview() {
  const { form } = useCreateJobForm();
  const name = useWatch({ control: form.control, name: "name" });
  const location = useWatch({ control: form.control, name: "location" });
  const contractType = useWatch({ control: form.control, name: "contractType" });
  const modality = useWatch({ control: form.control, name: "modality" });
  const description = useWatch({ control: form.control, name: "description" });

  const today = new Date().toLocaleDateString("es-UY", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Vista previa</CardTitle>
        <CardDescription>Así verán los candidatos tu oferta.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-start gap-4 rounded-lg border p-4">
          {/* TODO: logo real de la empresa, cuando esté conectado al back */}
          <div className="flex size-16 shrink-0 items-center justify-center rounded-md border text-muted-foreground">
            <BuildingIcon className="size-6" />
          </div>
          <div className="min-w-0">
            <p className="text-lg font-semibold">{name || "Título del puesto"}</p>
            {/* TODO: nombre real de la empresa, desde la sesión/Company */}
            <p className="text-sm text-muted-foreground">H-Move</p>
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
              {location && modality !== "REMOTO" && (
                <span className="flex items-center gap-1.5">
                  <MapPinIcon className="size-4" />
                  {location ? (DEPARTMENT_LABELS[location as keyof typeof DEPARTMENT_LABELS] ?? location) : null}
                </span>
              )}
              {contractType && (
                <span className="flex items-center gap-1.5">
                  <BriefcaseIcon className="size-4" />
                  {CONTRACT_TYPE_LABELS[contractType] ?? contractType}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <CalendarIcon className="size-4" />
                {today}
              </span>
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <p className="mb-2 flex items-center gap-2 text-sm font-medium">
            <FileTextIcon className="size-4" />
            Descripción
          </p>
          <p className="whitespace-pre-line text-sm text-muted-foreground">
            {description || "Sin descripción."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}