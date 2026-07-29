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
import { AuthFormSkeleton } from "@/features/auth/components/auth-layout";
import { useLogin } from "@/features/auth/hooks/use-login";
import { ApiError } from "@/lib/api-client";
import { applyFieldErrors } from "@/lib/form-errors";

/** Campos que el backend puede devolver en `errores` (A-19). El caso típico de
 *  login es 401/429 (banner), pero un 400 por campo se pega igual a su control. */
const BACKEND_FIELD_NAMES = new Set(["email", "password"]);

/**
 * Sin restricción de dominio (decisión de equipo, ver `RegisterForm`): un
 * alumno puede registrarse y loguearse con email personal + cédula, no solo
 * con `@ucu.edu.uy` (RN-01, vía b).
 */
const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Ingresá tu email.")
    .pipe(z.email("Ingresá un email válido."))
    .transform((value) => value.toLowerCase()),
  password: z.string().min(1, "Ingresá tu contraseña."),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error } = useLogin();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  return (
    <form
      onSubmit={handleSubmit(async ({ email, password }) => {
        try {
          await login({ email, password });
        } catch (cause) {
          // `useLogin().error` ya expone el mensaje general (401/429/etc.) de
          // forma reactiva; acá solo mapeamos un eventual error por campo (A-19)
          // a su control. Lo no mapeable queda cubierto por ese banner.
          if (cause instanceof ApiError && cause.fieldErrors) {
            applyFieldErrors(cause.fieldErrors, setError, BACKEND_FIELD_NAMES);
          }
        }
      })}
      noValidate
    >
      <FieldGroup>
        <Field data-invalid={Boolean(errors.email)}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            className="h-11 px-4 text-base focus-visible:border-ucu-blue focus-visible:ring-ucu-blue/20"
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
              autoComplete="current-password"
              aria-invalid={Boolean(errors.password)}
              className="h-11 px-4 pr-11 text-base focus-visible:border-ucu-blue focus-visible:ring-ucu-blue/20"
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
          {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          ¿No tenés cuenta?{" "}
          <Link href="/registro" className="font-medium text-ucu-blue hover:underline">
            Registrate
          </Link>
        </p>
      </FieldGroup>
    </form>
  );
}

/** Placeholder de `LoginForm` mientras `GuestOnly` resuelve la sesión. */
export function LoginFormSkeleton() {
  return <AuthFormSkeleton fields={2} />;
}
