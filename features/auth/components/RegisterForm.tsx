"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { AuthFormSkeleton } from "@/features/auth/components/AuthLayout";
import { useRegister } from "@/features/auth/hooks/use-register";

const registerSchema = z.object({
  documentNumber: z
    .string()
    .trim()
    .min(1, "Ingresá tu cédula.")
    .transform((value) => value.replace(/[.\-\s]/g, ""))
    .pipe(z.string().regex(/^\d{7,8}$/, "Ingresá una cédula válida.")),
  email: z
    .string()
    .trim()
    .min(1, "Ingresá tu email.")
    .pipe(z.email("Ingresá un email válido.")),
  password: z
    .string()
    .min(1, "Ingresá una contraseña.")
    .min(8, "La contraseña tiene que tener al menos 8 caracteres."),
});

type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const { register: submitRegistration, isLoading, error } = useRegister();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { documentNumber: "", email: "", password: "" },
  });

  return (
    <form onSubmit={handleSubmit((values) => submitRegistration(values))} noValidate>
      <FieldGroup>
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
