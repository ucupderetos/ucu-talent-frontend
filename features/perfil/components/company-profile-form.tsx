"use client";

import { Controller, useWatch, type UseFormReturn } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateCompanyProfile } from "@/features/perfil/hooks/use-update-company-profile";
import type { CompanyProfileFormValues } from "@/features/perfil/hooks/use-company-profile-form";
import { CompanyProfileReadOnly } from "@/features/perfil/components/company-profile-read-only";
import { COMPANY_DESCRIPTION_MAX } from "@/features/perfil/types";
import { DEPARTMENT_LABELS } from "@/features/perfil/hooks/use-company-profile-form";

export function CompanyProfileForm({
  form,
  mode,
  startEditing,
  commitSave,
  cancelEditing,
  isLoading: isCompanyLoading,
}: {
  form: UseFormReturn<CompanyProfileFormValues>;
  mode: "view" | "edit";
  startEditing: () => void;
  commitSave: (values: CompanyProfileFormValues) => void;
  cancelEditing: () => void;
  /** true mientras se carga la Company real (GET /company?userId=) — no
   *  confundir con isLoading del submit, que expone useUpdateCompanyProfile. */
  isLoading: boolean;
}) {
  const { updateProfile, isLoading: isSaving, error } = useUpdateCompanyProfile();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = form;

  const description = useWatch({ control, name: "description" }) ?? "";

  const onSubmit = handleSubmit(async (values) => {
    await updateProfile(values);
    commitSave(values);
  });

  if (isCompanyLoading) {
    return <CompanyProfileFormSkeleton />;
  }

  if (mode === "view") {
    return <CompanyProfileReadOnly form={form} onEdit={startEditing} />;
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <Card>
        <CardHeader>
          <CardTitle>Información general</CardTitle>
          <CardDescription>
            Completá los datos principales de tu empresa. Los campos marcados con * son obligatorios.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <div className="grid gap-6 sm:grid-cols-2">
              <Field data-invalid={Boolean(errors.name)}>
                <FieldLabel htmlFor="name">Razón social *</FieldLabel>
                <Input
                  id="name"
                  placeholder="H-Move"
                  aria-invalid={Boolean(errors.name)}
                  {...register("name")}
                />
                <FieldError errors={[errors.name]} />
              </Field>

              <Field data-invalid={Boolean(errors.webUrl)}>
                <FieldLabel htmlFor="webUrl">Sitio web *</FieldLabel>
                <Input
                  id="webUrl"
                  placeholder="https://hmove.com.uy"
                  aria-invalid={Boolean(errors.webUrl)}
                  {...register("webUrl")}
                />
                <FieldError errors={[errors.webUrl]} />
              </Field>
            </div>

            <Field data-invalid={Boolean(errors.description)}>
              <FieldLabel htmlFor="description">Descripción de la empresa *</FieldLabel>
              <p className="text-sm text-muted-foreground">
                Contá qué hace tu empresa, cuál es su propósito y qué la hace única.
              </p>
              <Textarea
                id="description"
                maxLength={COMPANY_DESCRIPTION_MAX}
                className="min-h-32"
                aria-invalid={Boolean(errors.description)}
                {...register("description")}
              />
              <p className="text-right text-xs text-muted-foreground">
                {description.length}/{COMPANY_DESCRIPTION_MAX}
              </p>
              <FieldError errors={[errors.description]} />
            </Field>

            <div className="grid gap-6 sm:grid-cols-2">
              <Field data-invalid={Boolean(errors.industry)}>
                <FieldLabel htmlFor="industry">Industria *</FieldLabel>
                <Input
                  id="industry"
                  placeholder="Marketing y Publicidad"
                  aria-invalid={Boolean(errors.industry)}
                  {...register("industry")}
                />
                <FieldError errors={[errors.industry]} />
              </Field>

              <Field data-invalid={Boolean(errors.location)}>
                <FieldLabel htmlFor="location">Ubicación principal *</FieldLabel>
                <Controller
                  control={control}
                  name="location"
                  render={({ field }) => (
                    <Select value={field.value ?? ""} onValueChange={field.onChange}>
                      <SelectTrigger
                        id="location"
                        className="w-full"
                        aria-invalid={Boolean(errors.location)}
                      >
                        <SelectValue placeholder="Seleccioná un departamento" />
                      </SelectTrigger>
                      <SelectContent position="popper" side="bottom" avoidCollisions={false}>
                        {Object.entries(DEPARTMENT_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[errors.location]} />
              </Field>
            </div>

            <Field data-invalid={Boolean(errors.linkedinUrl)}>
              <FieldLabel htmlFor="linkedinUrl">LinkedIn</FieldLabel>
              <Input
                id="linkedinUrl"
                placeholder="https://linkedin.com/company/tuempresa"
                {...register("linkedinUrl")}
              />
              <FieldError errors={[errors.linkedinUrl]} />
            </Field>

            {error && <FieldError>{error}</FieldError>}

            <div className="flex gap-2">
              <Button type="submit" disabled={isSaving} className="w-fit">
                {isSaving ? "Guardando..." : "Guardar cambios"}
              </Button>
              <Button type="button" variant="outline" onClick={cancelEditing} className="w-fit">
                Cancelar
              </Button>
            </div>
          </FieldGroup>
        </CardContent>
      </Card>
    </form>
  );
}

function CompanyProfileFormSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-72" />
      </CardHeader>
      <CardContent className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  );
}