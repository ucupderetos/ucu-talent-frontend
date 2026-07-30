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
import { ModalitySelector } from "@/features/puestos/components/modality-selector";

import { useCreateJobForm } from "@/features/puestos/hooks/use-create-job-form";
import { CONTRACT_TYPE_OPTIONS } from "@/lib/contract-types";
import { DEPARTMENTS, DEPARTMENT_LABELS } from "@/lib/departments";
import { useAreas } from "@/features/puestos/hooks/use-areas";
import type { ContractType } from "@/types";

const TITLE_MAX = 100;


export function JobBasicInfoForm() {
  const { form } = useCreateJobForm();
  const { data: areas, isLoading: isLoadingAreas } = useAreas();
  const {
    register,
    control,
    setValue,
    formState: { errors },
  } = form;

  const name = useWatch({ control, name: "name" }) ?? "";
  const areaId = useWatch({ control, name: "areaId" });
  const contractType = useWatch({ control, name: "contractType" });
  const modality = useWatch({ control, name: "modality" });
  const location = useWatch({ control, name: "location" });
  const publicationDate = useWatch({ control, name: "publicationDate" }) ?? "";

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
          {/* FieldSet (primitiva de `field`) para agrupar: título/área + tipo de contrato
              quedan más juntos entre sí (gap-3) que el gap-5 por default del FieldGroup. */}
          <FieldSet className="gap-3">
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
                    {isLoadingAreas && (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">Cargando áreas...</div>
                    )}
                    {areas?.map((area) => (
                      <SelectItem key={area.areaId} value={area.areaId}>
                        {area.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={[errors.areaId]} />
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
                  {CONTRACT_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={[errors.contractType]} />
            </Field>
          </FieldSet>

          <Field data-invalid={Boolean(errors.modality)}>
            <FieldLabel>Modalidad *</FieldLabel>
            <ModalitySelector
              value={modality}
              onChange={(value) => setValue("modality", value, { shouldValidate: true })}
            />
            <FieldError errors={[errors.modality]} />
          </Field>

          <Field data-invalid={Boolean(errors.location)}>
            <FieldLabel htmlFor="location">Departamento / Ciudad *</FieldLabel>
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

          <div className="grid gap-6 sm:grid-cols-2">
            <Field data-invalid={Boolean(errors.publicationDate)}>
              <FieldLabel htmlFor="publicationDate">Fecha de publicación *</FieldLabel>
              <Input
                id="publicationDate"
                type="date"
                className="h-11"
                aria-invalid={Boolean(errors.publicationDate)}
                {...register("publicationDate")}
              />
              <FieldError errors={[errors.publicationDate]} />
            </Field>

            <Field data-invalid={Boolean(errors.closingDate)}>
              <FieldLabel htmlFor="closingDate">Fecha de cierre *</FieldLabel>
              <Input
                id="closingDate"
                type="date"
                className="h-11"
                min={publicationDate || undefined}
                aria-invalid={Boolean(errors.closingDate)}
                {...register("closingDate")}
              />
              <FieldError errors={[errors.closingDate]} />
            </Field>
          </div>
        </FieldGroup>
      </CardContent>
    </Card>
  );
}