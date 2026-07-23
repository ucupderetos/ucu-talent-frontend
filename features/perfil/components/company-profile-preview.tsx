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
import { DEPARTMENT_LABELS, type CompanyProfileFormValues } from "@/features/perfil/hooks/use-company-profile-form";

export function CompanyProfilePreview({
  form,
}: {
  form: UseFormReturn<CompanyProfileFormValues>;
}) {
  const [name, location, industry, description] = useWatch({
    control: form.control,
    name: ["name", "location", "industry", "description"],
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vista previa pública</CardTitle>
        <CardDescription>Así verán los estudiantes la información de tu empresa.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border p-4">
          <div className="min-w-0">
            <p className="truncate font-semibold">
              {name || "Razón social"}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {location && (
                <Badge variant="secondary" className="gap-1 font-normal">
                  <MapPinIcon className="size-3" />
                  {DEPARTMENT_LABELS[location as keyof typeof DEPARTMENT_LABELS]}, Uruguay
                </Badge>
              )}
              {industry && (
                <Badge variant="secondary" className="gap-1 font-normal">
                  <TagIcon className="size-3" />
                  {industry}
                </Badge>
              )}
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