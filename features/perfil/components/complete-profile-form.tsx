"use client";

// Paso 2 del registro, reintentado con sesión ya activa — ver AGENTS.md,
// "Registro en dos pasos y ProfileGuard". Vive en /completar-perfil (FUERA de
// los route groups a propósito: adentro, `ProfileGuard` la redirigiría a sí
// misma en loop).
//
// A diferencia de `RegisterForm`, acá el rol no se elige con un checkbox: ya
// se sabe por `useSession()`. Los campos son los mismos mínimos `@NotBlank`
// de `docs/ENDPOINTS.md` que pide el paso 2 del wizard.

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCompleteProfile } from "@/features/perfil/hooks/use-complete-profile";
import { homeRouteFor } from "@/lib/auth";
import { isValidDocumentNumber } from "@/lib/validators";
import type { Department, DocumentType, Role } from "@/types";

/** Wire: `common.DocumentType`. Labels en español para UI. */
const DOCUMENT_TYPES: { value: DocumentType; label: string }[] = [
  { value: "CEDULA_IDENTIDAD", label: "Cédula de identidad" },
  { value: "PASAPORTE", label: "Pasaporte" },
  { value: "DNI", label: "DNI" },
];

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

const studentSchema = z
  .object({
    name: z.string().trim().min(1, "Ingresá tu nombre."),
    surname: z.string().trim().min(1, "Ingresá tu apellido."),
    documentType: z.enum(["CEDULA_IDENTIDAD", "PASAPORTE", "DNI"]),
    // El número se manda tal cual; el backend limpia los separadores. El
    // formato (por tipo) se valida en el `superRefine`.
    documentNumber: z.string().trim().min(1, "Ingresá tu número de documento."),
  })
  .superRefine((values, ctx) => {
    if (!isValidDocumentNumber(values.documentType, values.documentNumber)) {
      ctx.addIssue({
        code: "custom",
        path: ["documentNumber"],
        message: "Ingresá un número de documento válido.",
      });
    }
  });

const companySchema = z.object({
  name: z.string().trim().min(1, "Ingresá la razón social."),
  industry: z.string().trim().min(1, "Ingresá el rubro."),
  description: z.string().trim().min(1, "Contanos brevemente a qué se dedica la empresa."),
  webUrl: z.string().trim().min(1, "Ingresá el sitio web."),
  linkedinUrl: z.string().trim().min(1, "Ingresá el LinkedIn de la empresa."),
  location: z.string().min(1, "Elegí un departamento."),
});

type StudentValues = z.infer<typeof studentSchema>;
type CompanyValues = z.infer<typeof companySchema>;

export function CompleteProfileForm({ role }: { role: Extract<Role, "ALUMNO" | "EMPRESA"> }) {
  return role === "ALUMNO" ? <StudentForm /> : <CompanyForm />;
}

function StudentForm() {
  const router = useRouter();
  const { complete, isLoading, error } = useCompleteProfile();
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StudentValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: { name: "", surname: "", documentType: "CEDULA_IDENTIDAD", documentNumber: "" },
  });

  async function onSubmit(values: StudentValues) {
    await complete("ALUMNO", values);
    router.replace(homeRouteFor("ALUMNO"));
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <Field data-invalid={Boolean(errors.name)}>
          <FieldLabel htmlFor="name">Nombre</FieldLabel>
          <Input id="name" autoComplete="given-name" {...register("name")} />
          <FieldError errors={[errors.name]} />
        </Field>

        <Field data-invalid={Boolean(errors.surname)}>
          <FieldLabel htmlFor="surname">Apellido</FieldLabel>
          <Input id="surname" autoComplete="family-name" {...register("surname")} />
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
                  className="w-full"
                  aria-invalid={Boolean(errors.documentType)}
                >
                  <SelectValue placeholder="Elegí una opción" />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map((documentType) => (
                    <SelectItem key={documentType.value} value={documentType.value}>
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
          <Input id="documentNumber" autoComplete="off" {...register("documentNumber")} />
          <FieldError errors={[errors.documentNumber]} />
        </Field>

        {error && <FieldError>{error}</FieldError>}

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Guardando..." : "Continuar"}
        </Button>
      </FieldGroup>
    </form>
  );
}

function CompanyForm() {
  const router = useRouter();
  const { complete, isLoading, error } = useCompleteProfile();
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CompanyValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: "",
      industry: "",
      description: "",
      webUrl: "",
      linkedinUrl: "",
      location: "",
    },
  });

  async function onSubmit(values: CompanyValues) {
    await complete("EMPRESA", { ...values, location: values.location as Department });
    router.replace(homeRouteFor("EMPRESA"));
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <Field data-invalid={Boolean(errors.name)}>
          <FieldLabel htmlFor="name">Razón social</FieldLabel>
          <Input id="name" autoComplete="organization" {...register("name")} />
          <FieldError errors={[errors.name]} />
        </Field>

        <Field data-invalid={Boolean(errors.industry)}>
          <FieldLabel htmlFor="industry">Rubro</FieldLabel>
          <Input id="industry" {...register("industry")} />
          <FieldError errors={[errors.industry]} />
        </Field>

        <Field data-invalid={Boolean(errors.description)}>
          <FieldLabel htmlFor="description">Descripción</FieldLabel>
          <Input id="description" {...register("description")} />
          <FieldError errors={[errors.description]} />
        </Field>

        <Field data-invalid={Boolean(errors.webUrl)}>
          <FieldLabel htmlFor="webUrl">Sitio web</FieldLabel>
          <Input id="webUrl" type="url" autoComplete="url" {...register("webUrl")} />
          <FieldError errors={[errors.webUrl]} />
        </Field>

        <Field data-invalid={Boolean(errors.linkedinUrl)}>
          <FieldLabel htmlFor="linkedinUrl">LinkedIn</FieldLabel>
          <Input id="linkedinUrl" type="url" {...register("linkedinUrl")} />
          <FieldError errors={[errors.linkedinUrl]} />
        </Field>

        <Field data-invalid={Boolean(errors.location)}>
          <FieldLabel htmlFor="location">Departamento</FieldLabel>
          <Controller
            control={control}
            name="location"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="location" className="w-full" aria-invalid={Boolean(errors.location)}>
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

        {error && <FieldError>{error}</FieldError>}

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Guardando..." : "Continuar"}
        </Button>
      </FieldGroup>
    </form>
  );
}
