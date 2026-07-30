"use client";

// Formulario de "Editar oferta". A diferencia del wizard de creación
// (3 pasos, use-create-job-form.tsx), acá es un único form: la empresa ya
// completó todo una vez, editar es ajustar datos existentes, no un onboarding
// guiado. El área se muestra de solo lectura — `UpdateVacancyRequest` no la
// incluye (ver VacancyUpdateInput en features/puestos/types.ts).
//
// A-06 (resuelto por backend): `PUT /vacancy/{id}` devuelve
// `403 "El Puesto ya tiene postulaciones."` si la vacante tiene aunque sea
// una postulación (verificado contra `VacancyServiceImpl.updateVacancy`, rama
// `dev`). Con >=1 postulaciones ponemos el form entero en solo lectura
// (`isLocked`, ver EditVacancyView) — es el mismo gate que el backend, como
// UX, para no dejar completar un form que se comería el 403 al guardar. El
// caso FINALIZADO (también rechazado por el backend) lo filtra EditVacancyView
// antes de montar este form.

import { useEffect, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { LockIcon } from "lucide-react";
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
import { ModalitySelector } from "@/features/puestos/components/modality-selector";
import { CONTRACT_TYPES, CONTRACT_TYPE_OPTIONS } from "@/lib/contract-types";
import { DEPARTMENTS, DEPARTMENT_LABELS } from "@/lib/departments";
import { applyFieldErrors } from "@/lib/form-errors";
import {
  formatSalary,
  parseSalary,
  SALARY_AMOUNT_PATTERN,
  SALARY_CURRENCIES,
  SALARY_MODES,
  type SalaryCurrency,
  type SalaryMode,
} from "@/lib/salary";
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

// El wire (`Vacancy.salary` / `UpdateVacancyRequest.salary`) sigue siendo un
// único `string` — acá se ofrecen 2 modos de edición sobre ese mismo string:
// "estructurado" (moneda + monto desde + monto hasta, más cómodo para el
// caso común) y "texto libre" (un único input, para puestos viejos con texto
// no numérico como "A convenir" que el modo estructurado no puede
// representar sin perder información). El modo inicial lo decide
// `parseSalary` según si pudo extraer un monto numérico del valor guardado.
// Las utilidades (`formatSalary`/`parseSalary`/constantes) viven en
// `lib/salary.ts`, compartidas con el wizard de creación
// (`use-create-job-form.tsx`/`job-details-form.tsx`).

// Mismas reglas que `jobFormSchema` (use-create-job-form.tsx), sin `areaId`
// (`UpdateVacancyRequest` no lo incluye — el área queda fija desde la creación)
// y sin `publicationDate` editable (es read-only en edición, se reenvía la de la
// vacante). Es una factory porque el refine de `closingDate` compara contra esa
// `publicationDate` fija, que no vive en el form.
//
// Los 4 campos de salario (`salaryCurrency`/`salaryMin`/`salaryMax`/
// `salaryText`) son todos opcionales a nivel de tipo: cuáles son realmente
// obligatorios depende de `salaryMode`, así que esa parte de la validación
// vive en el `superRefine` de abajo (mismo patrón que `register-form.tsx`
// para campos condicionales por un discriminante).
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
      location: z.enum(DEPARTMENTS as [Department, ...Department[]], {
        message: "Seleccioná un departamento.",
      }),
      description: z.string().trim().min(1, "Ingresá la descripción del puesto."),
      requirements: z.string().trim().min(1, "Ingresá los requisitos del puesto."),
      salaryMode: z.enum(SALARY_MODES),
      salaryCurrency: z.enum(SALARY_CURRENCIES).optional(),
      salaryMin: z.string().trim().optional(),
      salaryMax: z.string().trim().optional(),
      salaryText: z.string().trim().optional(),
      closingDate: z.string().min(1, "Ingresá la fecha de cierre."),
    })
    .refine((data) => !data.closingDate || data.closingDate >= publicationDate, {
      message: "La fecha de cierre no puede ser anterior a la de publicación.",
      path: ["closingDate"],
    })
    .superRefine((data, ctx) => {
      if (data.salaryMode === "free") {
        if (!data.salaryText) {
          ctx.addIssue({ code: "custom", path: ["salaryText"], message: "Ingresá el rango salarial." });
        }
        return;
      }

      if (!data.salaryCurrency) {
        ctx.addIssue({ code: "custom", path: ["salaryCurrency"], message: "Seleccioná una moneda." });
      }
      if (!data.salaryMin || !SALARY_AMOUNT_PATTERN.test(data.salaryMin)) {
        ctx.addIssue({
          code: "custom",
          path: ["salaryMin"],
          message: "Ingresá un monto mínimo válido.",
        });
      }
      if (data.salaryMax && !SALARY_AMOUNT_PATTERN.test(data.salaryMax)) {
        ctx.addIssue({ code: "custom", path: ["salaryMax"], message: "Ingresá un monto válido." });
      }
      if (
        data.salaryMin &&
        data.salaryMax &&
        SALARY_AMOUNT_PATTERN.test(data.salaryMin) &&
        SALARY_AMOUNT_PATTERN.test(data.salaryMax) &&
        parseFloat(data.salaryMax.replace(",", ".")) < parseFloat(data.salaryMin.replace(",", "."))
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["salaryMax"],
          message: "El monto máximo debe ser mayor o igual al mínimo.",
        });
      }
    });
}

type EditJobFormValues = z.infer<ReturnType<typeof makeEditJobSchema>>;

// Campos que este form puede pegar 1 a 1 a un control. `salary` queda afuera a
// propósito: en la UI está partido en moneda/mínimo/máximo (o texto libre), así
// que un error del backend en `salary` no tiene un único control donde caer —
// `applyFieldErrors` lo devuelve en `unmapped` y va al banner de `root`.
const MAPPABLE_FIELDS = new Set([
  "name",
  "contractType",
  "modality",
  "location",
  "description",
  "requirements",
]);

export function EditJobForm({
  vacancy,
  onSubmit,
  isSubmitting,
  onCancel,
  isLocked = false,
  applicantsCount = 0,
  apiFieldErrors = null,
}: {
  vacancy: VacancyDetail;
  onSubmit: (values: VacancyUpdateInput) => void;
  isSubmitting: boolean;
  onCancel: () => void;
  /** A-06 (resuelto por backend): con >=1 postulaciones el `PUT /vacancy/{id}`
   *  devuelve `403 "El Puesto ya tiene postulaciones."`. Ponemos los campos en
   *  solo lectura como UX (espejo del gate real del backend), para no dejar
   *  editar un form que fallaría al guardar. */
  isLocked?: boolean;
  applicantsCount?: number;
  /**
   * Errores por campo del último intento de guardar fallido
   * (`ApiError.fieldErrors`, A-19) — se mapean a `setError` de RHF para que
   * se vean pegados al campo real en vez de solo en el toast genérico que ya
   * muestra `EditVacancyView`. `salary` (el único campo del wire sin
   * correspondencia 1 a 1 acá, partido en moneda/mínimo/máximo o texto
   * libre) cae en un error general al pie del form en vez de adivinar cuál
   * control corregir. `null` cuando no hay error pendiente de mostrar.
   */
  apiFieldErrors?: Record<string, string> | null;
}) {
  // `publicationDate` es read-only: se fija a la de la vacante y alimenta tanto
  // el refine de `closingDate` como el `min` del input y el display.
  const publicationDate = vacancy.publicationDate.slice(0, 10);
  const schema = useMemo(() => makeEditJobSchema(publicationDate), [publicationDate]);

  const parsedSalary = parseSalary(vacancy.salary);
  const initialSalaryMode: SalaryMode = parsedSalary.min ? "structured" : "free";
  const {
    register,
    control,
    setValue,
    setError,
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
      salaryMode: initialSalaryMode,
      salaryCurrency: parsedSalary.currency,
      salaryMin: parsedSalary.min,
      salaryMax: parsedSalary.max,
      salaryText: initialSalaryMode === "free" ? vacancy.salary : "",
      closingDate: vacancy.closingDate.slice(0, 10),
    },
  });

  const name = useWatch({ control, name: "name" }) ?? "";
  const description = useWatch({ control, name: "description" }) ?? "";
  const contractType = useWatch({ control, name: "contractType" });
  const modality = useWatch({ control, name: "modality" });
  const location = useWatch({ control, name: "location" });
  const salaryMode = useWatch({ control, name: "salaryMode" });
  const salaryCurrency = useWatch({ control, name: "salaryCurrency" });

  useEffect(() => {
    if (!apiFieldErrors) return;

    // `salary` (y cualquier campo que el backend agregue y este form no sepa
    // mapear) vuelve en `unmapped` → banner general de `root`.
    const { unmapped } = applyFieldErrors(apiFieldErrors, setError, MAPPABLE_FIELDS);
    if (unmapped.length > 0) {
      setError("root", { type: "server", message: unmapped.join(" · ") });
    }
  }, [apiFieldErrors, setError]);

  function submit(values: EditJobFormValues) {
    const salary =
      values.salaryMode === "free"
        ? (values.salaryText ?? "").trim()
        : formatSalary(
            values.salaryCurrency as SalaryCurrency,
            values.salaryMin ?? "",
            values.salaryMax ?? "",
          );

    onSubmit({
      name: values.name,
      contractType: values.contractType,
      modality: values.modality,
      // A-15: `location` es obligatorio para todas las modalidades (incluida
      // REMOTO); el schema ya lo exige, así que `values.location` siempre
      // llega definido.
      location: values.location,
      description: values.description,
      requirements: values.requirements,
      salary,
      // `publicationDate` no se edita: se reenvía la de la vacante (el contrato
      // la exige @NotNull en `UpdateVacancyRequest`). `closingDate` sí es editable.
      publicationDate,
      closingDate: values.closingDate,
    });
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-6">
      {isLocked && <LockedNotice applicantsCount={applicantsCount} />}
      {errors.root?.message && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {errors.root.message}
        </div>
      )}

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
                    disabled={isLocked}
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
                  disabled={isLocked}
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
                disabled={isLocked}
              />
              <FieldError errors={[errors.modality]} />
            </Field>

            <Field data-invalid={Boolean(errors.location)}>
              <FieldLabel htmlFor="location">Departamento / Ciudad *</FieldLabel>
              <Select
                value={location ?? ""}
                onValueChange={(v) => setValue("location", v as Department, { shouldValidate: true })}
                disabled={isLocked}
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
                  disabled={isLocked}
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
                  disabled={isLocked}
                  {...register("requirements")}
                />
                <FieldError errors={[errors.requirements]} />
              </Field>
            </FieldSet>

            <Field
              data-invalid={Boolean(
                errors.salaryCurrency || errors.salaryMin || errors.salaryMax || errors.salaryText,
              )}
            >
              <FieldLabel htmlFor={salaryMode === "free" ? "salaryText" : "salaryMin"}>
                Rango salarial *
              </FieldLabel>

              {salaryMode === "free" ? (
                // Modo texto libre: para puestos con un valor no numérico
                // guardado (ej. "A convenir") que el modo estructurado no
                // puede representar sin perder información — ver parseSalary.
                <>
                  <Input
                    id="salaryText"
                    className="h-11"
                    placeholder="Ej: A convenir, USD 700 - 900"
                    aria-invalid={Boolean(errors.salaryText)}
                    disabled={isLocked}
                    {...register("salaryText")}
                  />
                  <FieldError errors={[errors.salaryText]} />
                </>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-[6.5rem_1fr_1fr]">
                    <Select
                      value={salaryCurrency}
                      onValueChange={(value) =>
                        setValue("salaryCurrency", value as SalaryCurrency, { shouldValidate: true })
                      }
                      disabled={isLocked}
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
                      disabled={isLocked}
                      {...register("salaryMin")}
                    />
                    <Input
                      id="salaryMax"
                      className="h-11"
                      inputMode="decimal"
                      placeholder="Hasta (opcional)"
                      aria-label="Monto hasta"
                      aria-invalid={Boolean(errors.salaryMax)}
                      disabled={isLocked}
                      {...register("salaryMax")}
                    />
                  </div>
                  <FieldError errors={[errors.salaryCurrency, errors.salaryMin, errors.salaryMax]} />
                </>
              )}
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
                  disabled={isLocked}
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
          {isLocked ? "Volver" : "Cancelar"}
        </Button>
        {!isLocked && (
          <Button
            type="submit"
            className="h-11 bg-ucu-blue text-white hover:bg-ucu-blue/90"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Guardando..." : "Guardar cambios"}
          </Button>
        )}
      </div>
    </form>
  );
}

function LockedNotice({ applicantsCount }: { applicantsCount: number }) {
  return (
    <div className="flex items-start gap-2 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
      <LockIcon className="mt-0.5 size-4 shrink-0" />
      <span>
        Esta oferta ya tiene{" "}
        {applicantsCount === 1 ? "una postulación" : `${applicantsCount} postulaciones`}, así que
        sus datos quedaron fijos: no se pueden editar para no cambiarle la información a quien ya
        se postuló.
      </span>
    </div>
  );
}

