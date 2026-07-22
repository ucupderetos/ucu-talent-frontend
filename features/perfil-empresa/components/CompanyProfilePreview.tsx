"use client";

import { useWatch, type UseFormReturn } from "react-hook-form";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPinIcon, TagIcon } from "lucide-react";
import type { CompanyProfileFormValues } from "@/features/perfil-empresa/hooks/use-company-profile-form";
import { DEPARTMENT_LABELS } from "@/features/perfil-empresa/types";

export function CompanyProfilePreview({
  form,
}: {
  form: UseFormReturn<CompanyProfileFormValues>;
}) {
  const values = useWatch({ control: form.control });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vista previa pública</CardTitle>
        <CardDescription>Así verán los estudiantes la información de tu empresa.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border p-4">
          <div className="flex items-start gap-3">
            <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md border text-[10px] text-muted-foreground">
              {values.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- URL de texto, sin endpoint de upload todavía
                <img src={values.logoUrl} alt="Logo de la empresa" className="size-full object-cover" />
              ) : (
                "Logo"
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold">
                {values.razonSocial || "Razón social"}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {values.location && (
                  <Badge variant="secondary" className="gap-1 font-normal">
                    <MapPinIcon className="size-3" />
                    {DEPARTMENT_LABELS[values.location]}, Uruguay
                  </Badge>
                )}
                {values.industry && (
                  <Badge variant="secondary" className="gap-1 font-normal">
                    <TagIcon className="size-3" />
                    {values.industry}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          {values.description && (
            <p className="mt-3 text-sm text-muted-foreground">{values.description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}