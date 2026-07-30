"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronsUpDown, Eye, EyeOff } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AuthFormSkeleton } from "@/features/auth/components/auth-layout";
import {
  RegistrationError,
  useRegister,
  type RegistrationProfile,
} from "@/features/auth/hooks/use-register";
import type { Registration } from "@/features/auth/types";
import { DEPARTMENT_OPTIONS } from "@/lib/departments";
import { DOCUMENT_TYPE_OPTIONS } from "@/lib/document-types";
import { applyFieldErrors } from "@/lib/form-errors";
import { cn } from "@/lib/utils";
import { isValidDocumentNumber } from "@/lib/validators";
import type { Department } from "@/types";

/** Ignora acentos/mayúsculas para que "rio" encuentre "Río Negro". */
function normalizeForSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/**
 * Formulario multi-paso EN UNA SOLA PANTALLA, sin navegación entre medio (ver
 * AGENTS.md, "Registro en dos pasos y ProfileGuard"): "sin navegación entre
 * medio" es sobre rutas, no sobre pasos visuales — sigue siendo un único
 * componente en `/registro` que junta los datos de los 2 pasos del registro
 * real (`POST /user` + `POST /student-profile`/`/company`) en un único
 * submit. Si el paso de perfil llega a fallar después de que la cuenta ya
 * existe y está logueada, `ProfileGuard` (`features/perfil/`) atrapa ese caso
 * en la próxima carga y manda a `/completar-perfil` — no hace falta que este
 * form maneje ese escenario.
 *
 * UI en dos pasos (`step`, estado local, no de ruta):
 *   1. Tipo de cuenta + email + contraseña + repetir contraseña → "Continuar"
 *      valida solo esos campos (`trigger`) antes de avanzar.
 *   2. Los campos específicos del rol elegido → "Crear cuenta" dispara el
 *      submit real con el formulario completo.
 *
 * Los campos del paso 2 son los mínimos `@NotBlank` de `docs/ENDPOINTS.md`, ni
 * uno más: el resto (teléfono, LinkedIn, skills, descripción, foto) se
 * completa después desde `/perfil`.
 *
 * El email NO exige dominio `@ucu.edu.uy`: la vía de aprobación automática
 * por dominio institucional se descartó (ver AGENTS.md) — todo alumno se
 * registra igual, con cédula, y queda `PENDIENTE` hasta que se resuelva su
 * validación contra el padrón.
 */
const registerSchema = z
  .object({
    email: z
      .string()
      .trim()
      .min(1, "Ingresá tu email.")
      .pipe(z.email("Ingresá un email válido."))
      .transform((value) => value.toLowerCase()),
    password: z
      .string()
      .min(1, "Ingresá una contraseña.")
      .min(8, "La contraseña tiene que tener al menos 8 caracteres."),
    confirmPassword: z.string().min(1, "Repetí tu contraseña."),
    role: z.enum(["ALUMNO", "EMPRESA"]).optional(),
    // Alumno — StudentProfileRegistrationInput (campos mínimos)
    name: z.string().trim().optional(),
    surname: z.string().trim().optional(),
    documentType: z.enum(["CEDULA_IDENTIDAD", "PASAPORTE", "DNI"]),
    // El número se manda tal cual lo tipea el usuario; el backend limpia los
    // separadores. La validación de formato (por tipo) se hace en el
    // `superRefine`, que conoce el `documentType` elegido.
    documentNumber: z.string().trim().optional(),
    // Empresa — CompanyRegistrationInput (todos obligatorios en el backend)
    industry: z.string().trim().optional(),
    description: z.string().trim().optional(),
    webUrl: z.string().trim().optional(),
    linkedinUrl: z.string().trim().optional(),
    location: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    if (values.confirmPassword !== values.password) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Las contraseñas no coinciden.",
      });
    }

    if (!values.role) {
      ctx.addIssue({
        code: "custom",
        path: ["role"],
        message: "Elegí si te registrás como persona o como empresa.",
      });
      return;
    }

    if (values.role === "EMPRESA") {
      if (!values.name) {
        ctx.addIssue({ code: "custom", path: ["name"], message: "Ingresá la razón social." });
      }
      if (!values.industry) {
        ctx.addIssue({ code: "custom", path: ["industry"], message: "Ingresá el rubro." });
      }
      if (!values.description) {
        ctx.addIssue({
          code: "custom",
          path: ["description"],
          message: "Contanos brevemente a qué se dedica la empresa.",
        });
      }
      if (!values.webUrl) {
        ctx.addIssue({ code: "custom", path: ["webUrl"], message: "Ingresá el sitio web." });
      } else if (!z.url().safeParse(values.webUrl).success) {
        ctx.addIssue({
          code: "custom",
          path: ["webUrl"],
          message: "Ingresá una URL válida.",
        });
      }
      if (!values.linkedinUrl) {
        ctx.addIssue({
          code: "custom",
          path: ["linkedinUrl"],
          message: "Ingresá el LinkedIn de la empresa.",
        });
      }
      if (!values.location) {
        ctx.addIssue({
          code: "custom",
          path: ["location"],
          message: "Elegí un departamento.",
        });
      }
    } else {
      if (!values.name) {
        ctx.addIssue({ code: "custom", path: ["name"], message: "Ingresá tu nombre." });
      }
      if (!values.surname) {
        ctx.addIssue({ code: "custom", path: ["surname"], message: "Ingresá tu apellido." });
      }
      if (!values.documentNumber || !isValidDocumentNumber(values.documentType, values.documentNumber)) {
        ctx.addIssue({
          code: "custom",
          path: ["documentNumber"],
          message: "Ingresá un número de documento válido.",
        });
      }
    }
  });

type RegisterValues = z.infer<typeof registerSchema>;

/** Campos que valida el botón "Continuar" antes de pasar al paso 2. */
const ACCOUNT_STEP_FIELDS = ["role", "email", "password", "confirmPassword"] as const;

/** Campos que el backend puede devolver en `errores` (A-19). Las keys espejan
 *  1 a 1 los DTOs de registro (`CreateUserRequest` / `CreateStudentProfile
 *  Request` / `CreateCompanyRequest`, verificado contra el código del backend),
 *  que son los mismos nombres que usa RHF acá — por eso el mapeo es directo. */
const BACKEND_FIELD_NAMES = new Set([
  "email",
  "password",
  "name",
  "surname",
  "documentType",
  "documentNumber",
  "industry",
  "description",
  "webUrl",
  "linkedinUrl",
  "location",
]);

/** De esos, los que se editan en el paso "cuenta": si el backend rechaza uno,
 *  hay que volver a ese paso para que el error sea visible (el submit real vive
 *  en el paso "perfil"). */
const ACCOUNT_STEP_ERROR_FIELDS = new Set(["email", "password"]);

function toRegistration(values: RegisterValues): Registration {
  return {
    email: values.email,
    password: values.password,
    role: values.role!,
  };
}

function toProfile(values: RegisterValues): RegistrationProfile {
  if (values.role === "EMPRESA") {
    return {
      name: values.name!,
      industry: values.industry!,
      description: values.description!,
      webUrl: values.webUrl!,
      linkedinUrl: values.linkedinUrl!,
      location: values.location as Department,
    };
  }

  return {
    name: values.name!,
    surname: values.surname!,
    documentType: values.documentType,
    documentNumber: values.documentNumber!,
  };
}

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState<"cuenta" | "perfil">("cuenta");
  const [locationOpen, setLocationOpen] = useState(false);

  const { register: submitRegistration, isLoading, error } = useRegister();
  const {
    control,
    register,
    handleSubmit,
    setError,
    trigger,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      role: undefined,
      name: "",
      surname: "",
      documentType: "CEDULA_IDENTIDAD",
      documentNumber: "",
      industry: "",
      description: "",
      webUrl: "",
      linkedinUrl: "",
      location: undefined,
    },
  });

  const role = useWatch({ control, name: "role" });

  async function handleContinue() {
    const isAccountStepValid = await trigger(ACCOUNT_STEP_FIELDS);
    if (isAccountStepValid) {
      setStep("perfil");
    }
  }

  async function onSubmit(values: RegisterValues) {
    try {
      await submitRegistration(toRegistration(values), toProfile(values));
    } catch (cause) {
      if (!(cause instanceof RegistrationError)) return;
      const { step: failedStep, apiError } = cause;

      // El 409 SOLO significa "email duplicado" cuando viene del paso 1. Los
      // otros dos pasos también devuelven 409 (perfil ya existente, documento
      // repetido — ver RegistrationError), y tratarlos igual mandaba al usuario
      // al paso 1 con un mensaje falso sobre un campo que estaba bien.
      // El campo `email` vive en el paso "cuenta": como el submit real se
      // dispara desde "perfil", hay que volver a ese paso para que el error sea
      // visible.
      if (failedStep === "cuenta" && apiError.status === 409) {
        setStep("cuenta");
        setError("email", {
          type: "manual",
          message: "Ese email ya está registrado. ¿Ya tenés cuenta? Iniciá sesión.",
        });
        return;
      }

      // A-19: errores por campo del backend (ej. documento inválido, URL mal
      // formada) pegados a su control. Lo no mapeable cae en el banner genérico
      // que ya muestra `useRegister().error`.
      if (apiError.fieldErrors) {
        const { applied } = applyFieldErrors(apiError.fieldErrors, setError, BACKEND_FIELD_NAMES);
        if (applied.some((field) => ACCOUNT_STEP_ERROR_FIELDS.has(field))) {
          setStep("cuenta");
        }
      }

      // Un fallo del paso "perfil" deja al usuario donde está: la cuenta ya se
      // creó y la sesión está abierta, así que corregir el dato y reenviar
      // reintenta solo ese paso (ver el ref de `useRegister`). El motivo real
      // sale por el banner de arriba del botón.
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        {step === "cuenta" ? (
          <Fragment key="step-cuenta">
            <Field data-invalid={Boolean(errors.role)}>
              <FieldLabel htmlFor="role">Tipo de cuenta</FieldLabel>
              <Controller
                control={control}
                name="role"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="role"
                      className="data-[size=default]:h-11 w-full px-4 text-base"
                      aria-invalid={Boolean(errors.role)}
                    >
                      <SelectValue placeholder="Elegí una opción" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value="ALUMNO" className="py-2 text-base">
                        Persona
                      </SelectItem>
                      <SelectItem value="EMPRESA" className="py-2 text-base">
                        Empresa
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError errors={[errors.role]} />
            </Field>

            <Field data-invalid={Boolean(errors.email)}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
                className="h-11 px-4 text-base"
                {...register("email")}
              />
              <FieldError errors={[errors.email]} />
            </Field>

            <Field data-invalid={Boolean(errors.password)}>
              <FieldLabel htmlFor="password">Contraseña</FieldLabel>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  aria-invalid={Boolean(errors.password)}
                  className="h-11 px-4 pr-11 text-base"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  className="absolute inset-y-0 right-0 flex items-center px-3.5 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              <FieldError errors={[errors.password]} />
            </Field>

            <Field data-invalid={Boolean(errors.confirmPassword)}>
              <FieldLabel htmlFor="confirmPassword">Repetir contraseña</FieldLabel>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  aria-invalid={Boolean(errors.confirmPassword)}
                  className="h-11 px-4 pr-11 text-base"
                  {...register("confirmPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((value) => !value)}
                  aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  className="absolute inset-y-0 right-0 flex items-center px-3.5 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              <FieldError errors={[errors.confirmPassword]} />
            </Field>

            <Button
              type="button"
              onClick={handleContinue}
              className="h-12 w-full bg-ucu-blue text-base font-medium text-white hover:bg-ucu-blue/90"
            >
              Continuar
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              ¿Ya tenés cuenta?{" "}
              <Link href="/login" className="font-medium text-ucu-blue hover:underline">
                Iniciá sesión
              </Link>
            </p>
          </Fragment>
        ) : role === "EMPRESA" ? (
          <Fragment key="step-perfil-empresa">
            <Field data-invalid={Boolean(errors.name)}>
              <FieldLabel htmlFor="name">Razón social</FieldLabel>
              <Input
                id="name"
                autoComplete="organization"
                aria-invalid={Boolean(errors.name)}
                className="h-11 px-4 text-base"
                {...register("name")}
              />
              <FieldError errors={[errors.name]} />
            </Field>

            <Field data-invalid={Boolean(errors.industry)}>
              <FieldLabel htmlFor="industry">Rubro</FieldLabel>
              <Input
                id="industry"
                aria-invalid={Boolean(errors.industry)}
                className="h-11 px-4 text-base"
                {...register("industry")}
              />
              <FieldError errors={[errors.industry]} />
            </Field>

            <Field data-invalid={Boolean(errors.description)}>
              <FieldLabel htmlFor="description">Descripción</FieldLabel>
              <Input
                id="description"
                aria-invalid={Boolean(errors.description)}
                className="h-11 px-4 text-base"
                {...register("description")}
              />
              <FieldError errors={[errors.description]} />
            </Field>

            <Field data-invalid={Boolean(errors.webUrl)}>
              <FieldLabel htmlFor="webUrl">Sitio web</FieldLabel>
              <Input
                id="webUrl"
                type="url"
                autoComplete="url"
                aria-invalid={Boolean(errors.webUrl)}
                className="h-11 px-4 text-base"
                {...register("webUrl")}
              />
              <FieldError errors={[errors.webUrl]} />
            </Field>

            <Field data-invalid={Boolean(errors.linkedinUrl)}>
              <FieldLabel htmlFor="linkedinUrl">LinkedIn</FieldLabel>
              <Input
                id="linkedinUrl"
                type="url"
                aria-invalid={Boolean(errors.linkedinUrl)}
                className="h-11 px-4 text-base"
                {...register("linkedinUrl")}
              />
              <FieldError errors={[errors.linkedinUrl]} />
            </Field>

            <Field data-invalid={Boolean(errors.location)}>
              <FieldLabel htmlFor="location">Departamento</FieldLabel>
              <Controller
                control={control}
                name="location"
                render={({ field }) => {
                  const selected = DEPARTMENT_OPTIONS.find(
                    (department) => department.value === field.value,
                  );

                  return (
                    <Popover open={locationOpen} onOpenChange={setLocationOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          id="location"
                          type="button"
                          variant="outline"
                          role="combobox"
                          aria-expanded={locationOpen}
                          aria-invalid={Boolean(errors.location)}
                          className={cn(
                            "h-11 w-full justify-between px-4 text-base font-normal",
                            !selected && "text-muted-foreground",
                          )}
                        >
                          {selected ? selected.label : "Elegí un departamento"}
                          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        align="start"
                        className="w-(--radix-popover-trigger-width) p-0"
                      >
                        <Command
                          filter={(value, search) =>
                            normalizeForSearch(value).includes(normalizeForSearch(search)) ? 1 : 0
                          }
                        >
                          <CommandInput placeholder="Buscar departamento..." />
                          <CommandList>
                            <CommandEmpty>No se encontró el departamento.</CommandEmpty>
                            <CommandGroup>
                              {DEPARTMENT_OPTIONS.map((department) => (
                                <CommandItem
                                  key={department.value}
                                  value={department.label}
                                  data-checked={
                                    field.value === department.value ? "true" : undefined
                                  }
                                  onSelect={() => {
                                    field.onChange(department.value);
                                    setLocationOpen(false);
                                  }}
                                >
                                  {department.label}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  );
                }}
              />
              <FieldError errors={[errors.location]} />
            </Field>
          </Fragment>
        ) : role === "ALUMNO" ? (
          <Fragment key="step-perfil-alumno">
            <Field data-invalid={Boolean(errors.name)}>
              <FieldLabel htmlFor="name">Nombre</FieldLabel>
              <Input
                id="name"
                autoComplete="given-name"
                aria-invalid={Boolean(errors.name)}
                className="h-11 px-4 text-base"
                {...register("name")}
              />
              <FieldError errors={[errors.name]} />
            </Field>

            <Field data-invalid={Boolean(errors.surname)}>
              <FieldLabel htmlFor="surname">Apellido</FieldLabel>
              <Input
                id="surname"
                autoComplete="family-name"
                aria-invalid={Boolean(errors.surname)}
                className="h-11 px-4 text-base"
                {...register("surname")}
              />
              <FieldError errors={[errors.surname]} />
            </Field>

            <Field data-invalid={Boolean(errors.documentType)}>
              <FieldLabel htmlFor="documentType">Tipo de documento</FieldLabel>
              <Controller
                control={control}
                name="documentType"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="documentType"
                      className="data-[size=default]:h-11 w-full px-4 text-base"
                      aria-invalid={Boolean(errors.documentType)}
                    >
                      <SelectValue placeholder="Elegí una opción" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {DOCUMENT_TYPE_OPTIONS.map((documentType) => (
                        <SelectItem
                          key={documentType.value}
                          value={documentType.value}
                          className="py-2 text-base"
                        >
                          {documentType.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError errors={[errors.documentType]} />
            </Field>

            <Field data-invalid={Boolean(errors.documentNumber)}>
              <FieldLabel htmlFor="documentNumber">Número de documento</FieldLabel>
              <Input
                id="documentNumber"
                type="text"
                autoComplete="off"
                aria-invalid={Boolean(errors.documentNumber)}
                className="h-11 px-4 text-base"
                {...register("documentNumber")}
              />
              <FieldError errors={[errors.documentNumber]} />
            </Field>
          </Fragment>
        ) : null}

        {step === "perfil" && (
          <>
            {error && <FieldError>{error}</FieldError>}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep("cuenta")}
                className="h-12 flex-1 text-base font-medium"
              >
                Volver
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="h-12 flex-1 bg-ucu-blue text-base font-medium text-white hover:bg-ucu-blue/90"
              >
                {isLoading ? "Creando cuenta..." : "Crear cuenta"}
              </Button>
            </div>
          </>
        )}
      </FieldGroup>
    </form>
  );
}

/** Placeholder de `RegisterForm` mientras `GuestOnly` resuelve la sesión. */
export function RegisterFormSkeleton() {
  return <AuthFormSkeleton fields={5} />;
}
