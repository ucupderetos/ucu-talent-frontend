"use client";

import { useWatch, type UseFormReturn } from "react-hook-form";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MapPinIcon, TagIcon } from "lucide-react";
import type { CompanyProfileFormValues } from "@/features/perfil/hooks/use-company-profile-form";
import { DEPARTMENT_LABELS } from "@/lib/departments";

export function CompanyProfilePreview({
  form,
}: {
  form: UseFormReturn<CompanyProfileFormValues>;
}) {
  const [legalName, location, industry, description] = useWatch({
    control: form.control,
    name: ["legalName", "location", "industry", "description"],
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vista previa pública</CardTitle>
        <CardDescription>Así verán los estudiantes la información de tu empresa.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border p-4">
          <div className="flex items-start gap-3">
            {/* TODO(api): la imagen vendrá de `User.imageUrl` (compartida por
             *  empresa/alumno/admin) cuando el backend la exponga. Por ahora,
             *  círculo con la inicial de fallback — mismo tratamiento que el
             *  avatar de empresa en "Mis postulaciones" (application-card.tsx). */}
            <Avatar className="size-12 shrink-0">
              <AvatarFallback>{(legalName || "Razón social").charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate font-semibold">
                {legalName || "Razón social"}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {location && (
                  <Badge
                    variant="secondary"
                    className="gap-1 bg-secondary-blue font-normal text-secondary-blue-foreground"
                  >
                    <MapPinIcon className="size-3" />
                    {DEPARTMENT_LABELS[location]}, Uruguay
                  </Badge>
                )}
                {industry && (
                  <Badge
                    variant="secondary"
                    className="gap-1 bg-secondary-blue font-normal text-secondary-blue-foreground"
                  >
                    <TagIcon className="size-3" />
                    {industry}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          {description && (
            <p className="mt-3 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}