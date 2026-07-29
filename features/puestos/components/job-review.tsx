"use client";

import { useWatch } from "react-hook-form";
import {
  MapPinIcon,
  BriefcaseIcon,
  CalendarIcon,
  FileTextIcon,
  BuildingIcon,
  ClipboardListIcon,
  BanknoteIcon,
  LaptopIcon,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { useCreateJobForm } from "@/features/puestos/hooks/use-create-job-form";
import { CONTRACT_TYPE_LABELS } from "@/lib/contract-types";
import { DEPARTMENT_LABELS } from "@/lib/departments";

import { useCurrentCompany } from "@/hooks/use-current-company";

const MODALITY_LABELS: Record<string, string> = {
  PRESENCIAL: "Presencial",
  HIBRIDO: "Híbrida",
  REMOTO: "Remota",
};

function formatDate(iso: string): string {
  // `input type="date"` da `YYYY-MM-DD` — `new Date("YYYY-MM-DD")` lo
  // interpreta en UTC medianoche, que puede caer un día antes en UTC-3.
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("es-UY", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function JobReview() {
  const { company } = useCurrentCompany();
  const { form } = useCreateJobForm();
  const name = useWatch({ control: form.control, name: "name" });
  const location = useWatch({ control: form.control, name: "location" });
  const contractType = useWatch({ control: form.control, name: "contractType" });
  const modality = useWatch({ control: form.control, name: "modality" });
  const description = useWatch({ control: form.control, name: "description" });
  const requirements = useWatch({ control: form.control, name: "requirements" });
  const salary = useWatch({ control: form.control, name: "salary" });
  const publicationDate = useWatch({ control: form.control, name: "publicationDate" });
  const closingDate = useWatch({ control: form.control, name: "closingDate" });

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
            <p className="text-sm text-muted-foreground">{company?.name}</p>
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
              {location && modality !== "REMOTO" && (
                <span className="flex items-center gap-1.5">
                  <MapPinIcon className="size-4" />
                  {DEPARTMENT_LABELS[location as keyof typeof DEPARTMENT_LABELS] ?? location}
                </span>
              )}
              {contractType && (
                <span className="flex items-center gap-1.5">
                  <BriefcaseIcon className="size-4" />
                  {CONTRACT_TYPE_LABELS[contractType as keyof typeof CONTRACT_TYPE_LABELS] ?? contractType}
                </span>
              )}
              {modality && (
                <span className="flex items-center gap-1.5">
                  <LaptopIcon className="size-4" />
                  {MODALITY_LABELS[modality] ?? modality}
                </span>
              )}
              {salary && (
                <span className="flex items-center gap-1.5">
                  <BanknoteIcon className="size-4" />
                  {salary}
                </span>
              )}
              {publicationDate && (
                <span className="flex items-center gap-1.5">
                  <CalendarIcon className="size-4" />
                  Publica el {formatDate(publicationDate)}
                  {closingDate && ` · cierra el ${formatDate(closingDate)}`}
                </span>
              )}
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

        <Separator />

        <div>
          <p className="mb-2 flex items-center gap-2 text-sm font-medium">
            <ClipboardListIcon className="size-4" />
            Requisitos
          </p>
          <p className="whitespace-pre-line text-sm text-muted-foreground">
            {requirements || "Sin requisitos."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}