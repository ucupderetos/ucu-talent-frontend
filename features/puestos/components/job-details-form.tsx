"use client";

import { useWatch } from "react-hook-form";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { useCreateJobForm } from "@/features/puestos/hooks/use-create-job-form";
import { SALARY_CURRENCIES, type SalaryCurrency } from "@/lib/salary";

const DESCRIPTION_MAX = 2000;

export function JobDetailsForm() {
  const { form } = useCreateJobForm();
  const {
    register,
    control,
    setValue,
    formState: { errors },
  } = form;

  const description = useWatch({ control, name: "description" }) ?? "";
  const salaryCurrency = useWatch({ control, name: "salaryCurrency" });

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
          {/* FieldSet (primitiva de `field`) para agrupar: descripción + requisitos
              quedan más juntos entre sí (gap-3) que el gap-5 por default del FieldGroup. */}
          <FieldSet className="gap-3">
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
          </FieldSet>

          <Field
            data-invalid={Boolean(errors.salaryCurrency || errors.salaryMin || errors.salaryMax)}
          >
            <FieldLabel htmlFor="salaryMin">Rango salarial *</FieldLabel>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[6.5rem_1fr_1fr]">
              <Select
                value={salaryCurrency}
                onValueChange={(value) =>
                  setValue("salaryCurrency", value as SalaryCurrency, { shouldValidate: true })
                }
              >
                <SelectTrigger
                  className="w-full data-[size=default]:h-11"
                  aria-label="Moneda"
                  aria-invalid={Boolean(errors.salaryCurrency)}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SALARY_CURRENCIES.map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                id="salaryMin"
                className="h-11"
                inputMode="decimal"
                placeholder="Desde"
                aria-label="Monto desde"
                aria-invalid={Boolean(errors.salaryMin)}
                {...register("salaryMin")}
              />
              <Input
                id="salaryMax"
                className="h-11"
                inputMode="decimal"
                placeholder="Hasta (opcional)"
                aria-label="Monto hasta"
                aria-invalid={Boolean(errors.salaryMax)}
                {...register("salaryMax")}
              />
            </div>
            <FieldError errors={[errors.salaryCurrency, errors.salaryMin, errors.salaryMax]} />
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  );
}
