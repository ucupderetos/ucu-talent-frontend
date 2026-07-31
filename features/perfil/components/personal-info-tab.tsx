"use client";

// Pestaña "Información personal" de Mi perfil: teléfono, LinkedIn y
// descripción son los campos editables desde acá — nombre, apellido y
// documento quedan siempre de solo lectura, con el resto del registro.
//
// `PUT /student-profile/{id}` reemplaza el objeto entero (ver
// use-update-student-profile.ts): el submit manda `skills` del borrador
// compartido (`draft`, dueño en `student-profile-view.tsx`) sin tocar, junto
// con los campos que sí edita esta pestaña. Es el mismo borrador que usa
// "Habilidades" — necesario porque el backend exige los cuatro campos no
// vacíos en cada request, y las dos pestañas los reparten (ver el comentario
// en `StudentProfileDraft`, features/perfil/types.ts).
//
// ⚠️ Los tres campos de acá empujan a `onDraftChange` en su propio `onChange`
// — EN VIVO, mientras se tipea, no recién al guardar. Si solo actualizaran el
// borrador compartido al guardar, el caso que motivó todo esto seguiría
// roto: en una cuenta recién creada (los cuatro campos vacíos), para que
// "Habilidades" pueda guardar necesita que ESTOS tres ya tengan valor en el
// borrador — y si acá solo se guardan al hacer submit de esta pestaña, nunca
// hay una primera vez en la que alcance con guardar cualquiera de las dos
// pestañas sola. Igual que en "Habilidades", donde `skills` empuja al
// borrador en cada agregar/quitar, no solo al guardar.

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ReadOnlyField } from "@/features/perfil/components/read-only-field";
import { useUpdateStudentProfile } from "@/features/perfil/hooks/use-update-student-profile";
import { PROFILE_ITEM_DESCRIPTION_MAX } from "@/features/perfil/types";
import type { StudentProfileDraft } from "@/features/perfil/types";
import { isExternalUrl } from "@/lib/urls";
import type { StudentProfile } from "@/types";

const personalInfoSchema = z.object({
  phoneNumber: z.string().trim(),
  // Vacío sigue siendo válido (el campo no es obligatorio en el form), pero si
  // hay algo tiene que ser una URL: la vista de solo lectura lo renderiza como
  // link clickeable, así que un `mi-perfil` suelto terminaría en un
  // `https://mi-perfil` que no resuelve.
  linkedinUrl: z
    .string()
    .trim()
    .refine((value) => value === "" || isExternalUrl(value), {
      message: "Ingresá una URL válida.",
    }),
  description: z
    .string()
    .trim()
    .max(PROFILE_ITEM_DESCRIPTION_MAX, `Máximo ${PROFILE_ITEM_DESCRIPTION_MAX} caracteres.`),
});

type PersonalInfoFormValues = z.infer<typeof personalInfoSchema>;

function toFormValues(draft: StudentProfileDraft): PersonalInfoFormValues {
  return {
    phoneNumber: draft.phoneNumber,
    linkedinUrl: draft.linkedinUrl,
    description: draft.description,
  };
}

export function PersonalInfoTab({
  profile,
  draft,
  onDraftChange,
}: {
  profile: StudentProfile;
  draft: StudentProfileDraft;
  onDraftChange: (patch: Partial<StudentProfileDraft>) => void;
}) {
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [valuesBeforeEdit, setValuesBeforeEdit] = useState(() => toFormValues(draft));
  const { updateProfile, isLoading, error } = useUpdateStudentProfile(profile.studentProfileId);

  const form = useForm<PersonalInfoFormValues>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: toFormValues(draft),
  });

  const description = useWatch({ control: form.control, name: "description" });

  function startEditing() {
    const current = toFormValues(draft);
    form.reset(current);
    setValuesBeforeEdit(current);
    setMode("edit");
  }

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      // `skills` sale del borrador compartido: puede haber sido editado desde
      // "Habilidades" sin que esa pestaña se haya guardado todavía.
      await updateProfile({ ...values, skills: draft.skills });
      onDraftChange(values);
      form.reset(values);
      setMode("view");
      toast.success("Información personal actualizada.");
    } catch {
      // Revierte el borrador compartido al punto de partida de esta edición
      // — sin esto, el empuje en vivo de los `onChange` de abajo deja el
      // borrador (y la vista) mostrando el intento fallido en vez del último
      // estado real guardado (mismo bug que en "Habilidades", encontrado en
      // QA manual).
      onDraftChange(valuesBeforeEdit);
    }
  });

  function cancelEditing() {
    // Revierte el borrador compartido al punto de partida de esta edición —
    // como los `onChange` de abajo empujan en vivo a `onDraftChange`, cancelar
    // sin esto dejaría los cambios descartados pegados en la vista y
    // guardables desde "Habilidades" (mismo rollback que el `catch` de arriba).
    onDraftChange(valuesBeforeEdit);
    form.reset(valuesBeforeEdit);
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
          <Button type="button" variant="outline" onClick={startEditing}>
            Editar
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <ReadOnlyField label="Nombres" value={profile.name} />
            <ReadOnlyField label="Apellidos" value={profile.surname} />
            <ReadOnlyField label="Teléfono" value={draft.phoneNumber} />
            <ReadOnlyField label="LinkedIn" value={draft.linkedinUrl} isLink />
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium">Descripción</p>
            <p
              className={
                draft.description
                  ? "whitespace-pre-line text-sm"
                  : "text-sm italic text-muted-foreground"
              }
            >
              {draft.description || "Sin completar"}
            </p>
          </div>
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
                <Input
                  id="phoneNumber"
                  placeholder="099123456"
                  {...form.register("phoneNumber", {
                    onChange: (e) => onDraftChange({ phoneNumber: e.target.value }),
                  })}
                />
              </Field>

              <Field data-invalid={Boolean(form.formState.errors.linkedinUrl)}>
                <FieldLabel htmlFor="linkedinUrl">LinkedIn</FieldLabel>
                <Input
                  id="linkedinUrl"
                  placeholder="https://linkedin.com/in/tu-usuario"
                  aria-invalid={Boolean(form.formState.errors.linkedinUrl)}
                  {...form.register("linkedinUrl", {
                    onChange: (e) => onDraftChange({ linkedinUrl: e.target.value }),
                  })}
                />
                <FieldError errors={[form.formState.errors.linkedinUrl]} />
              </Field>
            </div>

            <Field data-invalid={Boolean(form.formState.errors.description)}>
              <FieldLabel htmlFor="description">Descripción</FieldLabel>
              <Textarea
                id="description"
                className="min-h-24 max-h-40 overflow-y-auto"
                maxLength={PROFILE_ITEM_DESCRIPTION_MAX}
                placeholder="Contá un poco sobre vos: tu perfil profesional, intereses, qué estás buscando."
                {...form.register("description", {
                  onChange: (e) => onDraftChange({ description: e.target.value }),
                })}
              />
              <p className="text-right text-xs text-muted-foreground">
                {description.length}/{PROFILE_ITEM_DESCRIPTION_MAX}
              </p>
              <FieldError errors={[form.formState.errors.description]} />
            </Field>

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

