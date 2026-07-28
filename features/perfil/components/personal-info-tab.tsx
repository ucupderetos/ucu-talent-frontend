"use client";

// Pestaña "Información personal" de Mi perfil: teléfono y LinkedIn son los
// ÚNICOS campos editables desde acá — nombre, apellido y documento no viajan
// en `UpdateStudentProfileRequest` (docs/ENDPOINTS.md, sección 3), así que
// quedan siempre de solo lectura, con el resto del registro. Mismo patrón
// view/edit que CompanyProfileForm, pero sin separar en un componente
// ReadOnly aparte: al ser un solo formulario chico no vale la pena partirlo.
//
// `PUT /student-profile/{id}` reemplaza el objeto entero (ver
// use-update-student-profile.ts): el submit manda `skills`/`description` de
// `profile` sin tocar, junto con los campos que sí edita esta pestaña.

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useUpdateStudentProfile } from "@/features/perfil/hooks/use-update-student-profile";
import type { StudentProfile } from "@/types";

const personalInfoSchema = z.object({
  phoneNumber: z.string().trim(),
  linkedinUrl: z.string().trim(),
});

type PersonalInfoFormValues = z.infer<typeof personalInfoSchema>;

function toFormValues(profile: StudentProfile): PersonalInfoFormValues {
  return {
    phoneNumber: profile.phoneNumber ?? "",
    linkedinUrl: profile.linkedinUrl ?? "",
  };
}

export function PersonalInfoTab({ profile }: { profile: StudentProfile }) {
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [savedValues, setSavedValues] = useState(() => toFormValues(profile));
  const { updateProfile, isLoading, error } = useUpdateStudentProfile(profile.studentProfileId);

  const form = useForm<PersonalInfoFormValues>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: savedValues,
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await updateProfile({
      ...values,
      skills: profile.skills,
      description: profile.description ?? "",
    });
    setSavedValues(values);
    form.reset(values);
    setMode("view");
    toast.success("Información personal actualizada.");
  });

  function cancelEditing() {
    form.reset(savedValues);
    setMode("view");
  }

  if (mode === "view") {
    return (
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>Información personal</CardTitle>
            <CardDescription>Estos datos son visibles para las empresas.</CardDescription>
          </div>
          <Button type="button" variant="outline" onClick={() => setMode("edit")}>
            Editar
          </Button>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          <ReadOnlyField label="Nombres" value={profile.name} />
          <ReadOnlyField label="Apellidos" value={profile.surname} />
          <ReadOnlyField label="Teléfono" value={savedValues.phoneNumber} />
          <ReadOnlyField label="LinkedIn" value={savedValues.linkedinUrl} />
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <Card>
        <CardHeader>
          <CardTitle>Información personal</CardTitle>
          <CardDescription>Estos datos son visibles para las empresas.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <div className="grid gap-6 sm:grid-cols-2">
              <ReadOnlyField label="Nombres" value={profile.name} />
              <ReadOnlyField label="Apellidos" value={profile.surname} />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="phoneNumber">Teléfono</FieldLabel>
                <Input id="phoneNumber" placeholder="099123456" {...form.register("phoneNumber")} />
              </Field>

              <Field>
                <FieldLabel htmlFor="linkedinUrl">LinkedIn</FieldLabel>
                <Input
                  id="linkedinUrl"
                  placeholder="https://linkedin.com/in/tu-usuario"
                  {...form.register("linkedinUrl")}
                />
              </Field>
            </div>

            {error && <FieldError>{error}</FieldError>}

            <div className="flex gap-2">
              <Button type="submit" disabled={isLoading} className="w-fit">
                {isLoading ? "Guardando..." : "Guardar cambios"}
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

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium">{label}</p>
      <p className={value ? "text-sm" : "text-sm italic text-muted-foreground"}>
        {value || "Sin completar"}
      </p>
    </div>
  );
}
