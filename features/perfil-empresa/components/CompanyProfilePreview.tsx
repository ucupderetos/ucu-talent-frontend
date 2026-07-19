"use client";

import { useWatch, type UseFormReturn } from "react-hook-form";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPinIcon, TagIcon, Users2Icon, ExternalLinkIcon } from "lucide-react";
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
            <div className="flex size-12 shrink-0 items-center justify-center rounded-md border text-[10px] text-muted-foreground">
              Logo
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold">
                {values.name || "Nombre de la empresa"}
              </p>
              <div className="mt-1 flex flex-col gap-1 text-sm text-muted-foreground">
                {values.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPinIcon className="size-3.5 shrink-0" />
                    {DEPARTMENT_LABELS[values.location]}, Uruguay
                  </span>
                )}
                {values.industry && (
                  <span className="flex items-center gap-1.5">
                    <TagIcon className="size-3.5 shrink-0" />
                    {values.industry}
                  </span>
                )}
                {values.companySize && (
                  <span className="flex items-center gap-1.5">
                    <Users2Icon className="size-3.5 shrink-0" />
                    {values.companySize} empleados
                  </span>
                )}
              </div>
            </div>
          </div>
          {values.description && (
            <p className="mt-3 text-sm text-muted-foreground">{values.description}</p>
          )}
        </div>
        <Button variant="link" className="mt-2 h-auto gap-1 p-0 text-sm" type="button">
          Ver perfil público
          <ExternalLinkIcon className="size-3.5" />
        </Button>
      </CardContent>
    </Card>
  );
}

/** Placeholder de `CompanyProfilePreview` mientras se resuelve la carga
 *  inicial del perfil (GET /company?userId=), cuando el back esté conectado. */
export function CompanyProfilePreviewSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-56" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-24 w-full" />
      </CardContent>
    </Card>
  );
}