"use client";

import { useWatch, type UseFormReturn } from "react-hook-form";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { CompanyProfileFormValues } from "@/features/perfil/hooks/use-company-profile-form";
import { DEPARTMENT_LABELS } from "@/lib/departments";

function ReadOnlyField({
  label,
  value,
  placeholder = "Sin completar",
}: {
  label: string;
  value: string | undefined;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium">{label}</p>
      <p className={value ? "text-sm" : "text-sm text-muted-foreground italic"}>
        {value || placeholder}
      </p>
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
  const [
    logoUrl,
    legalName,
    rut,
    phoneNumber,
    webUrl,
    description,
    industry,
    location,
    linkedinUrl,
  ] = useWatch({
    control: form.control,
    name: [
      "logoUrl",
      "legalName",
      "rut",
      "phoneNumber",
      "webUrl",
      "description",
      "industry",
      "location",
      "linkedinUrl",
    ],
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
        {/* A-11: sin endpoint de upload todavía. Mismo tratamiento que el
         *  avatar de empresa en "Mis postulaciones" (application-card.tsx) —
         *  círculo con la inicial de fallback, no el cuadrado rounded-md que
         *  había acá antes. */}
        <div className="space-y-1">
          <p className="text-sm font-medium">Logo</p>
          <Avatar className="size-24">
            <AvatarImage src={logoUrl || undefined} alt="Logo de la empresa" />
            <AvatarFallback className="text-lg">
              {(legalName || "Empresa").charAt(0)}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <ReadOnlyField label="Razón social" value={legalName} />
          <ReadOnlyField label="RUT" value={rut} />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <ReadOnlyField label="Teléfono" value={phoneNumber} />
          <ReadOnlyField label="Sitio web" value={webUrl} />
        </div>

        <ReadOnlyField label="Descripción" value={description} />

        <div className="grid gap-6 sm:grid-cols-2">
          <ReadOnlyField label="Industria" value={industry} />
          <ReadOnlyField
            label="Ubicación principal"
            value={location ? DEPARTMENT_LABELS[location] : undefined}
          />
        </div>

        <ReadOnlyField label="LinkedIn" value={linkedinUrl} />
      </CardContent>
    </Card>
  );
}