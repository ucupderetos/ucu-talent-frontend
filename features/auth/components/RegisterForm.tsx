"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AuthFormSkeleton } from "@/features/auth/components/AuthLayout";
import { useRegister, type RegistrationProfile } from "@/features/auth/hooks/use-register";
import type { Registration } from "@/features/auth/types";
import { ApiError } from "@/lib/api-client";
import type { Department } from "@/types";

const CEDULA_REGEX = /^\d{7,8}$/;

/** Wire: `Department` (19 valores, ver `docs/ENDPOINTS.md`). Labels en
 *  español para UI — son cara al usuario. */
const DEPARTMENTS: { value: Department; label: string }[] = [
  { value: "ARTIGAS", label: "Artigas" },
  { value: "CANELONES", label: "Canelones" },
  { value: "CERRO_LARGO", label: "Cerro Largo" },
  { value: "COLONIA", label: "Colonia" },
  { value: "DURAZNO", label: "Durazno" },
  { value: "FLORES", label: "Flores" },
  { value: "FLORIDA", label: "Florida" },
  { value: "LAVALLEJA", label: "Lavalleja" },
  { value: "MALDONADO", label: "Maldonado" },
  { value: "MONTEVIDEO", label: "Montevideo" },
  { value: "PAYSANDU", label: "Paysandú" },
  { value: "RIO_NEGRO", label: "Río Negro" },
  { value: "RIVERA", label: "Rivera" },
  { value: "ROCHA", label: "Rocha" },
  { value: "SALTO", label: "Salto" },
  { value: "SAN_JOSE", label: "San José" },
  { value: "SORIANO", label: "Soriano" },
  { value: "TACUAREMBO", label: "Tacuarembó" },
  { value: "TREINTA_Y_TRES", label: "Treinta y Tres" },
];

/**
 * Formulario multi-paso EN UNA SOLA PANTALLA, sin navegación entre medio (ver
 * AGENTS.md, "Registro en dos pasos y ProfileGuard"): junta los datos de los
 * 2 pasos del registro real (`POST /user` + `POST /student-profile`/`/company`)
 * en un único submit. Si el paso de perfil llega a fallar después de que la
 * cuenta ya existe y está logueada, `ProfileGuard` (`features/perfil/`)
 * atrapa ese caso en la próxima carga y manda a `/completar-perfil` — no hace
 * falta que este form maneje ese escenario.
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
    isCompany: z.boolean(),
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
    // Alumno — StudentProfileRegistrationInput (campos mínimos)
    name: z.string().trim().optional(),
    surname: z.string().trim().optional(),
    documentNumber: z
      .string()
      .trim()
      .transform((value) => value.replace(/[.\-\s]/g, ""))
      .optional(),
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

    if (values.isCompany) {
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
      if (!values.documentNumber || !CEDULA_REGEX.test(values.documentNumber)) {
        ctx.addIssue({
          code: "custom",
          path: ["documentNumber"],
          message: "Ingresá una cédula válida.",
        });
      }
    }
  });

type RegisterValues = z.infer<typeof registerSchema>;

function toRegistration(values: RegisterValues): Registration {
  return {
    email: values.email,
    password: values.password,
    role: values.isCompany ? "EMPRESA" : "ALUMNO",
  };
}

function toProfile(values: RegisterValues): RegistrationProfile {
  if (values.isCompany) {
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
    // RN-01: se descartó la vía de aprobación automática por dominio
    // @ucu.edu.uy — todo alumno se registra con cédula.
    documentType: "CEDULA_IDENTIDAD",
    documentNumber: values.documentNumber!,
  };
}

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const { register: submitRegistration, isLoading, error } = useRegister();
  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      isCompany: false,
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
      surname: "",
      documentNumber: "",
      industry: "",
      description: "",
      webUrl: "",
      linkedinUrl: "",
      location: undefined,
    },
  });

  const isCompany = useWatch({ control, name: "isCompany" });

  async function onSubmit(values: RegisterValues) {
    try {
      await submitRegistration(toRegistration(values), toProfile(values));
    } catch (cause) {
      // El 409 (email duplicado, paso 1) se muestra en el campo, no en el
      // banner genérico — `useRegister().error` ya lo silencia para ese caso.
      if (cause instanceof ApiError && cause.status === 409) {
        setError("email", {
          type: "manual",
          message: "Ese email ya está registrado. ¿Ya tenés cuenta? Iniciá sesión.",
        });
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <Field orientation="horizontal">
          <Controller
            control={control}
            name="isCompany"
            render={({ field }) => (
              <Checkbox
                id="isCompany"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <FieldLabel htmlFor="isCompany" className="font-normal">
            Soy empresa
          </FieldLabel>
        </Field>

        <Field data-invalid={Boolean(errors.email)}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            className="h-12 px-4 text-base focus-visible:border-ucu-blue focus-visible:ring-ucu-blue/20"
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
              className="h-12 px-4 pr-11 text-base focus-visible:border-ucu-blue focus-visible:ring-ucu-blue/20"
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
          <Input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            aria-invalid={Boolean(errors.confirmPassword)}
            className="h-12 px-4 text-base focus-visible:border-ucu-blue focus-visible:ring-ucu-blue/20"
            {...register("confirmPassword")}
          />
          <FieldError errors={[errors.confirmPassword]} />
        </Field>

        {isCompany ? (
          <>
            <Field data-invalid={Boolean(errors.name)}>
              <FieldLabel htmlFor="name">Razón social</FieldLabel>
              <Input
                id="name"
                autoComplete="organization"
                aria-invalid={Boolean(errors.name)}
                className="h-12 px-4 text-base focus-visible:border-ucu-blue focus-visible:ring-ucu-blue/20"
                {...register("name")}
              />
              <FieldError errors={[errors.name]} />
            </Field>

            <Field data-invalid={Boolean(errors.industry)}>
              <FieldLabel htmlFor="industry">Rubro</FieldLabel>
              <Input
                id="industry"
                aria-invalid={Boolean(errors.industry)}
                className="h-12 px-4 text-base focus-visible:border-ucu-blue focus-visible:ring-ucu-blue/20"
                {...register("industry")}
              />
              <FieldError errors={[errors.industry]} />
            </Field>

            <Field data-invalid={Boolean(errors.description)}>
              <FieldLabel htmlFor="description">Descripción</FieldLabel>
              <Input
                id="description"
                aria-invalid={Boolean(errors.description)}
                className="h-12 px-4 text-base focus-visible:border-ucu-blue focus-visible:ring-ucu-blue/20"
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
                className="h-12 px-4 text-base focus-visible:border-ucu-blue focus-visible:ring-ucu-blue/20"
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
                className="h-12 px-4 text-base focus-visible:border-ucu-blue focus-visible:ring-ucu-blue/20"
                {...register("linkedinUrl")}
              />
              <FieldError errors={[errors.linkedinUrl]} />
            </Field>

            <Field data-invalid={Boolean(errors.location)}>
              <FieldLabel htmlFor="location">Departamento</FieldLabel>
              <Controller
                control={control}
                name="location"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="location"
                      className="h-12 w-full px-4 text-base"
                      aria-invalid={Boolean(errors.location)}
                    >
                      <SelectValue placeholder="Elegí un departamento" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map((department) => (
                        <SelectItem key={department.value} value={department.value}>
                          {department.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError errors={[errors.location]} />
            </Field>
          </>
        ) : (
          <>
            <Field data-invalid={Boolean(errors.name)}>
              <FieldLabel htmlFor="name">Nombre</FieldLabel>
              <Input
                id="name"
                autoComplete="given-name"
                aria-invalid={Boolean(errors.name)}
                className="h-12 px-4 text-base focus-visible:border-ucu-blue focus-visible:ring-ucu-blue/20"
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
                className="h-12 px-4 text-base focus-visible:border-ucu-blue focus-visible:ring-ucu-blue/20"
                {...register("surname")}
              />
              <FieldError errors={[errors.surname]} />
            </Field>

            <Field data-invalid={Boolean(errors.documentNumber)}>
              <FieldLabel htmlFor="documentNumber">Cédula</FieldLabel>
              <Input
                id="documentNumber"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                aria-invalid={Boolean(errors.documentNumber)}
                className="h-12 px-4 text-base focus-visible:border-ucu-blue focus-visible:ring-ucu-blue/20"
                {...register("documentNumber")}
              />
              <FieldError errors={[errors.documentNumber]} />
            </Field>
          </>
        )}

        {error && <FieldError>{error}</FieldError>}

        <Button
          type="submit"
          disabled={isLoading}
          className="h-12 w-full bg-ucu-blue text-base font-medium text-white hover:bg-ucu-blue/90"
        >
          {isLoading ? "Creando cuenta..." : "Crear cuenta"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="font-medium text-ucu-blue hover:underline">
            Iniciá sesión
          </Link>
        </p>
      </FieldGroup>
    </form>
  );
}

/** Placeholder de `RegisterForm` mientras `GuestOnly` resuelve la sesión. */
export function RegisterFormSkeleton() {
  return <AuthFormSkeleton fields={5} />;
}
