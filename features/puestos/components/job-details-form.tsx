"use client";

import { useWatch } from "react-hook-form";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { useCreateJobForm } from "@/features/puestos/hooks/use-create-job-form";

const DESCRIPTION_MAX = 2000;

export function JobDetailsForm() {
  const { form } = useCreateJobForm();
  const {
    register,
    control,
    formState: { errors },
  } = form;

  const description = useWatch({ control, name: "description" }) ?? "";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalles del puesto</CardTitle>
        <CardDescription>
          Contá de qué se trata el puesto, las responsabilidades principales y qué buscás en la persona ideal.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field data-invalid={Boolean(errors.description)}>
            <FieldLabel htmlFor="description">Descripción del puesto *</FieldLabel>
            <Textarea
              id="description"
              maxLength={DESCRIPTION_MAX}
              className="min-h-48"
              aria-invalid={Boolean(errors.description)}
              {...register("description")}
            />
            <p className="text-right text-xs text-muted-foreground">
              {description.length}/{DESCRIPTION_MAX}
            </p>
            <FieldError errors={[errors.description]} />
          </Field>

          <Field data-invalid={Boolean(errors.requirements)}>
            <FieldLabel htmlFor="requirements">Requisitos *</FieldLabel>
            <p className="text-sm text-muted-foreground">
              ¿Qué conocimientos, experiencia o habilidades necesita la persona que aplique?
            </p>
            <Textarea
              id="requirements"
              className="min-h-32"
              aria-invalid={Boolean(errors.requirements)}
              {...register("requirements")}
            />
            <FieldError errors={[errors.requirements]} />
          </Field>

          <Field data-invalid={Boolean(errors.salaryRange)}>
            <FieldLabel htmlFor="salaryRange">Rango salarial *</FieldLabel>
            <Input
              id="salaryRange"
              className="h-11"
              placeholder="$45.000 - $60.000 UYU"
              aria-invalid={Boolean(errors.salaryRange)}
              {...register("salaryRange")}
            />
            <FieldError errors={[errors.salaryRange]} />
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  );
}