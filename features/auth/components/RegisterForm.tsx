"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { AuthFormSkeleton } from "@/features/auth/components/AuthLayout";
import { useRegister } from "@/features/auth/hooks/use-register";
import type { Registration } from "@/features/auth/types";
import { ApiError } from "@/lib/api-client";

/**
 * El registro solo pide email, contraseña y rol — decisión de equipo: nombre,
 * cédula, RUT y el resto del perfil se completan después desde "editar
 * perfil" (`features/perfil/`, todavía sin construir), tanto para alumno
 * como para empresa.
 *
 * El email NO exige dominio `@ucu.edu.uy` para nadie: el alumno tiene dos vías
 * excluyentes de alta (RN-01) — (a) email `@ucu.edu.uy` → aprobado automático,
 * o (b) email personal + cédula validada contra el padrón — así que restringir
 * el dominio en el form bloquearía la vía (b), que es válida por SRS.
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
  })
  .superRefine((values, ctx) => {
    if (values.confirmPassword !== values.password) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Las contraseñas no coinciden.",
      });
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
    defaultValues: { isCompany: false, email: "", password: "", confirmPassword: "" },
  });

  async function onSubmit(values: RegisterValues) {
    try {
      await submitRegistration(toRegistration(values));
    } catch (cause) {
      // El 409 (email duplicado) se muestra en el campo, no en el banner
      // genérico — `useRegister().error` ya lo silencia para ese caso.
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
  return <AuthFormSkeleton fields={3} />;
}
