"use client";

import { useWatch } from "react-hook-form";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

import { useCreateJobForm } from "@/features/crear-oferta/hooks/use-create-job-form";

const DESCRIPTION_MAX = 2000;

export function JobDetailsForm() {
  const form = useCreateJobForm();
  const {
    register,
    control,
    formState: { errors },
  } = form;

  const description = useWatch({ control, name: "description" }) ?? "";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Descripción del puesto</CardTitle>
        <CardDescription>
          Contá de qué se trata el puesto, las responsabilidades principales y qué buscás en la persona ideal.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field data-invalid={Boolean(errors.description)}>
            <Textarea
              id="description"
              maxLength={DESCRIPTION_MAX}
              className="min-h-64"
              aria-invalid={Boolean(errors.description)}
              {...register("description")}
            />
            <p className="text-right text-xs text-muted-foreground">
              {description.length}/{DESCRIPTION_MAX}
            </p>
            <FieldError errors={[errors.description]} />
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  );
}