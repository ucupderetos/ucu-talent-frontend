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
import { Button } from "@/components/ui/button";
import type { CompanyProfileFormValues } from "@/features/perfil/hooks/use-company-profile-form";
import { DEPARTMENT_LABELS } from "@/lib/departments";

function toHref(url: string) {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function ReadOnlyField({
  label,
  value,
  placeholder = "Sin completar",
  isLink = false,
}: {
  label: string;
  value: string | undefined;
  placeholder?: string;
  isLink?: boolean;
}) {
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium">{label}</p>
      {value ? (
        isLink ? (
          <a
            href={toHref(value)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary underline underline-offset-2 hover:opacity-80"
          >
            {value}
          </a>
        ) : (
          <p className="text-sm">{value}</p>
        )
      ) : (
        <p className="text-sm text-muted-foreground italic">{placeholder}</p>
      )}
    </div>
  );
}

export function CompanyProfileReadOnly({
  form,
  onEdit,
}: {
  form: UseFormReturn<CompanyProfileFormValues>;
  onEdit: () => void;
}) {
  const [legalName, webUrl, description, industry, location, linkedinUrl] = useWatch({
    control: form.control,
    name: ["legalName", "webUrl", "description", "industry", "location", "linkedinUrl"],
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>Información general</CardTitle>
          <CardDescription>Los datos actuales de tu empresa.</CardDescription>
        </div>
        <Button type="button" variant="outline" onClick={onEdit}>
          Editar perfil
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* TODO(api): la imagen vendrá de `User.imageUrl` (compartida por
         *  empresa/alumno/admin) cuando el backend la exponga. Por ahora,
         *  círculo con la inicial de fallback. */}
        <div className="space-y-1">
          <p className="text-sm font-medium">Logo</p>
          <Avatar className="size-24">
            <AvatarFallback className="text-lg">
              {(legalName || "Empresa").charAt(0)}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <ReadOnlyField label="Razón social" value={legalName} />
          <ReadOnlyField label="Sitio web" value={webUrl} isLink />
        </div>

        <ReadOnlyField label="Descripción" value={description} />

        <div className="grid gap-6 sm:grid-cols-2">
          <ReadOnlyField label="Industria" value={industry} />
          <ReadOnlyField
            label="Ubicación principal"
            value={location ? DEPARTMENT_LABELS[location] : undefined}
          />
        </div>

        <ReadOnlyField label="LinkedIn" value={linkedinUrl} isLink />
      </CardContent>
    </Card>
  );
}