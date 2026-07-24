"use client";

import { useWatch } from "react-hook-form";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPinIcon, HomeIcon, LaptopIcon } from "lucide-react";

import { useCreateJobForm } from "@/features/puestos/hooks/use-create-job-form";
import { DEPARTMENTS, DEPARTMENT_LABELS } from "@/features/puestos/types";
import { cn } from "@/lib/utils";

const TITLE_MAX = 100;

// TODO: reemplazar por catálogo real de GET /area cuando esté conectado.
const AREAS_PLACEHOLDER = [
  { value: "marketing", label: "Marketing y Publicidad" },
  { value: "tecnologia", label: "Tecnología" },
  { value: "finanzas", label: "Finanzas" },
];

const MODALITY_OPTIONS = [
  { value: "PRESENCIAL", label: "Presencial", helper: "En sitio", icon: MapPinIcon },
  { value: "HIBRIDO", label: "Híbrida", helper: "Combinada", icon: HomeIcon },
  { value: "REMOTO", label: "Remota", helper: "A distancia", icon: LaptopIcon },
] as const;

export function JobBasicInfoForm() {
  const { form } = useCreateJobForm();
  const {
    register,
    control,
    setValue,
    formState: { errors },
  } = form;

  const name = useWatch({ control, name: "name" }) ?? "";
  const areaId = useWatch({ control, name: "areaId" });
  const modality = useWatch({ control, name: "modality" });
  const location = useWatch({ control, name: "location" });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Información básica</CardTitle>
        <CardDescription>
          Contanos los datos principales del puesto que estás buscando cubrir.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <div className="grid gap-6 sm:grid-cols-2">
            <Field data-invalid={Boolean(errors.name)}>
              <FieldLabel htmlFor="name">Título del puesto *</FieldLabel>
              <Input
                id="name"
                className="h-11"
                placeholder="Pasante de Marketing"
                maxLength={TITLE_MAX}
                aria-invalid={Boolean(errors.name)}
                {...register("name")}
              />
              <p className="text-right text-xs text-muted-foreground">
                {name.length}/{TITLE_MAX}
              </p>
              <FieldError errors={[errors.name]} />
            </Field>

            <Field data-invalid={Boolean(errors.areaId)}>
              <FieldLabel htmlFor="areaId">Área *</FieldLabel>
              <Select value={areaId ?? ""} onValueChange={(v) => setValue("areaId", v, { shouldValidate: true })}>
                <SelectTrigger
                  id="areaId"
                  className="w-full data-[size=default]:h-11"
                  aria-invalid={Boolean(errors.areaId)}
                >
                  <SelectValue placeholder="Seleccioná un área" />
                </SelectTrigger>
                <SelectContent>
                  {AREAS_PLACEHOLDER.map((area) => (
                    <SelectItem key={area.value} value={area.value}>
                      {area.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={[errors.areaId]} />
            </Field>
          </div>

          <Field data-invalid={Boolean(errors.contractType)}>
            <FieldLabel htmlFor="contractType">Tipo de contrato *</FieldLabel>
            <Input
              id="contractType"
              className="h-11"
              placeholder="Pasantía, Full-time, Part-time..."
              aria-invalid={Boolean(errors.contractType)}
              {...register("contractType")}
            />
            <FieldError errors={[errors.contractType]} />
          </Field>

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
              onValueChange={(v) => setValue("location", v as (typeof DEPARTMENTS)[number], { shouldValidate: true })}
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
  );
}