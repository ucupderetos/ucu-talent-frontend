"use client";

// Formulario de "Editar oferta". A diferencia del wizard de creación
// (3 pasos, use-create-job-form.tsx), acá es un único form: la empresa ya
// completó todo una vez, editar es ajustar datos existentes, no un onboarding
// guiado. El área se muestra de solo lectura — `UpdateVacancyRequest` no la
// incluye (ver VacancyUpdateInput en features/puestos/types.ts).

import { useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { HomeIcon, LaptopIcon, MapPinIcon } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
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
import { DEPARTMENTS, DEPARTMENT_LABELS } from "@/lib/departments";
import { cn } from "@/lib/utils";
import { CONTRACT_TYPES, CONTRACT_TYPE_LABELS } from "@/lib/contract-types";
import type { VacancyDetail, VacancyUpdateInput } from "@/features/puestos/types";
import type { ContractType, Department, Modality } from "@/types";

const TITLE_MAX = 100;
const DESCRIPTION_MAX = 2000;

/** `YYYY-MM-DD` → `dd/mm/yyyy` sin pasar por `new Date()` (evita el corrimiento
 *  de día por UTC en UTC-3). Solo para el display read-only de la publicación. */
function formatDate(iso: string): string {
  const [year, month, day] = iso.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
}

// satisfies (no `as`): si Modality gana/pierde un valor en @/types, esto
// rompe la build en vez de quedar desincronizado en silencio (mismo criterio
// que use-create-job-form.tsx).
const MODALITIES = ["PRESENCIAL", "HIBRIDO", "REMOTO"] as const satisfies readonly Modality[];

const MODALITY_OPTIONS = [
  { value: "PRESENCIAL", label: "Presencial", helper: "En sitio", icon: MapPinIcon },
  { value: "HIBRIDO", label: "Híbrida", helper: "Combinada", icon: HomeIcon },
  { value: "REMOTO", label: "Remota", helper: "A distancia", icon: LaptopIcon },
] as const;

// Mismas reglas que `jobFormSchema` (use-create-job-form.tsx), sin `areaId`
// (`UpdateVacancyRequest` no lo incluye — el área queda fija desde la creación)
// y sin `publicationDate` editable (es read-only en edición, se reenvía la de la
// vacante). Es una factory porque el refine de `closingDate` compara contra esa
// `publicationDate` fija, que no vive en el form.
function makeEditJobSchema(publicationDate: string) {
  return z
    .object({
      name: z
        .string()
        .trim()
        .min(1, "Ingresá el título del puesto.")
        .max(TITLE_MAX, `Máximo ${TITLE_MAX} caracteres.`),
      contractType: z.enum(CONTRACT_TYPES, "Seleccioná un tipo de contrato."),
      modality: z.enum(MODALITIES, "Seleccioná una modalidad."),
      location: z.enum(DEPARTMENTS as [Department, ...Department[]]).optional(),
      description: z.string().trim().min(1, "Ingresá la descripción del puesto."),
      requirements: z.string().trim().min(1, "Ingresá los requisitos del puesto."),
      salaryRange: z.string().trim().min(1, "Ingresá el rango salarial."),
      closingDate: z.string().min(1, "Ingresá la fecha de cierre."),
    })
    .refine((data) => data.modality === "REMOTO" || Boolean(data.location), {
      message: "La ubicación es obligatoria salvo que la modalidad sea remota.",
      path: ["location"],
    })
    .refine((data) => !data.closingDate || data.closingDate >= publicationDate, {
      message: "La fecha de cierre no puede ser anterior a la de publicación.",
      path: ["closingDate"],
    });
}

type EditJobFormValues = z.infer<ReturnType<typeof makeEditJobSchema>>;

export function EditJobForm({
  vacancy,
  onSubmit,
  isSubmitting,
  onCancel,
}: {
  vacancy: VacancyDetail;
  onSubmit: (values: VacancyUpdateInput) => void;
  isSubmitting: boolean;
  onCancel: () => void;
}) {
  // `publicationDate` es read-only: se fija a la de la vacante y alimenta tanto
  // el refine de `closingDate` como el `min` del input y el display.
  const publicationDate = vacancy.publicationDate.slice(0, 10);
  const schema = useMemo(() => makeEditJobSchema(publicationDate), [publicationDate]);

  const {
    register,
    control,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<EditJobFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: vacancy.name,
      contractType: vacancy.contractType,
      modality: vacancy.modality,
      location: vacancy.location,
      description: vacancy.description,
      requirements: vacancy.requirements,
      // La entidad `Vacancy` expone el sueldo como `salary`; el payload de update
      // lo manda como `salaryRange` (ver `VacancyUpdateInput`, types.ts).
      salaryRange: vacancy.salary,
      closingDate: vacancy.closingDate.slice(0, 10),
    },
  });

  const name = useWatch({ control, name: "name" }) ?? "";
  const description = useWatch({ control, name: "description" }) ?? "";
  const contractType = useWatch({ control, name: "contractType" });
  const modality = useWatch({ control, name: "modality" });
  const location = useWatch({ control, name: "location" });

  function submit(values: EditJobFormValues) {
    onSubmit({
      name: values.name,
      contractType: values.contractType,
      modality: values.modality,
      // El refine ya garantiza `location` salvo modalidad REMOTO — A-15 sigue
      // sin definir qué mandar ahí (ver use-publish-job.ts), así que se manda
      // el valor previo de la vacante como fallback en vez de "".
      location: (values.location ?? vacancy.location) as Department,
      description: values.description,
      requirements: values.requirements,
      salaryRange: values.salaryRange,
      // `publicationDate` no se edita: se reenvía la de la vacante (el contrato
      // la exige @NotNull en `UpdateVacancyRequest`). `closingDate` sí es editable.
      publicationDate,
      closingDate: values.closingDate,
    });
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Información básica</CardTitle>
          <CardDescription>El área no se puede modificar una vez creado el puesto.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <FieldSet className="gap-3">
              <div className="grid gap-6 sm:grid-cols-2">
                <Field data-invalid={Boolean(errors.name)}>
                  <FieldLabel htmlFor="name">Título del puesto *</FieldLabel>
                  <Input
                    id="name"
                    className="h-11"
                    maxLength={TITLE_MAX}
                    aria-invalid={Boolean(errors.name)}
                    {...register("name")}
                  />
                  <p className="text-right text-xs text-muted-foreground">
                    {name.length}/{TITLE_MAX}
                  </p>
                  <FieldError errors={[errors.name]} />
                </Field>

                <Field>
                  <FieldLabel>Área</FieldLabel>
                  <div className="flex h-11 items-center rounded-lg border border-input bg-muted px-4 text-sm text-muted-foreground">
                    {vacancy.areaName}
                  </div>
                </Field>
              </div>

              <Field data-invalid={Boolean(errors.contractType)}>
                <FieldLabel htmlFor="contractType">Tipo de contrato *</FieldLabel>
                <Select
                  value={contractType ?? ""}
                  onValueChange={(v) =>
                    setValue("contractType", v as ContractType, { shouldValidate: true })
                  }
                >
                  <SelectTrigger
                    id="contractType"
                    className="w-full data-[size=default]:h-11"
                    aria-invalid={Boolean(errors.contractType)}
                  >
                    <SelectValue placeholder="Seleccioná un tipo de contrato" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTRACT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {CONTRACT_TYPE_LABELS[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={[errors.contractType]} />
              </Field>
            </FieldSet>

            <Field data-invalid={Boolean(errors.modality)}>
              <FieldLabel>Modalidad *</FieldLabel>
              <div className="grid gap-3 sm:grid-cols-3">
                {MODALITY_OPTIONS.map((option) => {
                  const isSelected = modality === option.value;
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setValue("modality", option.value, { shouldValidate: true })}
                      className={cn(
                        "flex items-center gap-3 rounded-lg border p-4 text-left transition-colors",
                        isSelected ? "border-primary bg-primary/5" : "border-input hover:bg-accent/50",
                      )}
                    >
                      <Icon className="size-5 shrink-0 text-muted-foreground" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{option.label}</p>
                        <p className="text-xs text-muted-foreground">{option.helper}</p>
                      </div>
                      <span
                        className={cn(
                          "ml-auto flex size-4 shrink-0 items-center justify-center rounded-full border-2",
                          isSelected ? "border-primary" : "border-muted-foreground/30",
                        )}
                      >
                        {isSelected && <span className="size-2 rounded-full bg-primary" />}
                      </span>
                    </button>
                  );
                })}
              </div>
              <FieldError errors={[errors.modality]} />
            </Field>

            <Field data-invalid={Boolean(errors.location)}>
              <FieldLabel htmlFor="location">
                Departamento / Ciudad {modality !== "REMOTO" && "*"}
              </FieldLabel>
              <Select
                value={location ?? ""}
                onValueChange={(v) => setValue("location", v as Department, { shouldValidate: true })}
              >
                <SelectTrigger
                  id="location"
                  className="w-full data-[size=default]:h-11"
                  aria-invalid={Boolean(errors.location)}
                >
                  <SelectValue placeholder="Seleccioná un departamento" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {DEPARTMENT_LABELS[dept]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={[errors.location]} />
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detalles del puesto</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup>
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
                <Textarea
                  id="requirements"
                  className="min-h-32"
                  aria-invalid={Boolean(errors.requirements)}
                  {...register("requirements")}
                />
                <FieldError errors={[errors.requirements]} />
              </Field>
            </FieldSet>

            <Field data-invalid={Boolean(errors.salaryRange)}>
              <FieldLabel htmlFor="salaryRange">Rango salarial *</FieldLabel>
              <Input
                id="salaryRange"
                className="h-11"
                aria-invalid={Boolean(errors.salaryRange)}
                {...register("salaryRange")}
              />
              <FieldError errors={[errors.salaryRange]} />
            </Field>

            <div className="grid gap-6 sm:grid-cols-2">
              <Field>
                <FieldLabel>Fecha de publicación</FieldLabel>
                {/* Read-only: no se mueve la fecha de publicación de algo ya
                    publicado. Se reenvía tal cual en el submit. */}
                <div className="flex h-11 items-center rounded-lg border border-input bg-muted px-4 text-sm text-muted-foreground">
                  {formatDate(publicationDate)}
                </div>
              </Field>

              <Field data-invalid={Boolean(errors.closingDate)}>
                <FieldLabel htmlFor="closingDate">Fecha de cierre *</FieldLabel>
                <Input
                  id="closingDate"
                  type="date"
                  className="h-11"
                  min={publicationDate}
                  aria-invalid={Boolean(errors.closingDate)}
                  {...register("closingDate")}
                />
                <FieldError errors={[errors.closingDate]} />
              </Field>
            </div>
          </FieldGroup>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          className="h-11"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="h-11 bg-ucu-blue text-white hover:bg-ucu-blue/90"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}
