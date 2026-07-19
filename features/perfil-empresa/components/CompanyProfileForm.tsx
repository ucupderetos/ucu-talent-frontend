"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LinkIcon } from "lucide-react";
import { useForm, useWatch, type SubmitHandler } from "react-hook-form"; import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateCompanyProfile } from "@/features/perfil-empresa/hooks/use-update-company-profile";
import {
    DEPARTMENTS,
    DEPARTMENT_LABELS,
    DESCRIPTION_MAX,
} from "@/features/perfil-empresa/types";


// Reglas de validación del formulario. Reflejan los @NotBlank/@NotNull del
// back donde corresponde (CreateCompanyRequest / UpdateCompanyRequest), más
// las reglas propias de UI para los campos sin respaldo en el back todavía.
const companyProfileSchema = z.object({
    name: z.string().trim().min(1, "Ingresá el nombre de la empresa."),
    webUrl: z
        .string()
        .trim()
        .min(1, "Ingresá el sitio web.")
        .pipe(z.url("Ingresá una URL válida.")),
    description: z
        .string()
        .trim()
        .min(1, "Ingresá una descripción.")
        .max(DESCRIPTION_MAX, `Máximo ${DESCRIPTION_MAX} caracteres.`),
    industry: z.string().trim().min(1, "Ingresá la industria."),
    location: z.enum(DEPARTMENTS, "Seleccioná un departamento."),
    linkedinUrl: z.string().trim(),
    // TODO: sin respaldo en el back — sin validación estricta por ahora.
    companySize: z.string(),
    foundedYear: z.string(),
    instagramUrl: z.string(),
    facebookUrl: z.string(),
});

export type CompanyProfileFormValues = z.infer<typeof companyProfileSchema>;

/** Input de red social con ícono a la izquierda. Genérico (LinkIcon), no logos
 *  de marca, para mantener consistencia con el resto de la app (monocromática). */
function SocialField({
    id,
    label,
    placeholder,
    ...registerProps
}: {
    id: string;
    label: string;
    placeholder: string;
} & ReturnType<ReturnType<typeof useForm>["register"]>) {
    return (
        <div className="relative">
            <LinkIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
                id={id}
                aria-label={label}
                className="pl-9"
                placeholder={placeholder}
                {...registerProps}
            />
        </div>
    );
}

export function CompanyProfileForm() {
    const { updateProfile, isLoading, error } = useUpdateCompanyProfile();
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<CompanyProfileFormValues>({
        resolver: zodResolver(companyProfileSchema),
        defaultValues: {
            name: "",
            webUrl: "",
            description: "",
            industry: "",
            location: undefined,
            linkedinUrl: "",
            companySize: "",
            foundedYear: "",
            instagramUrl: "",
            facebookUrl: "",
        },
    });

    const description = useWatch({ control, name: "description" }) ?? "";
    const location = useWatch({ control, name: "location" });

    const onSubmit: SubmitHandler<CompanyProfileFormValues> = (values) => {
        updateProfile(values);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Información general</CardTitle>
                    <CardDescription>Completá los datos principales de tu empresa.</CardDescription>
                </CardHeader>
                <CardContent>
                    <FieldGroup>
                        <div className="grid gap-6 sm:grid-cols-2">
                            {/* Logo — TODO: sin respaldo en el back */}
                            <Field>
                                <FieldLabel>Logo de la empresa</FieldLabel>
                                <div className="flex size-24 items-center justify-center rounded-md border text-xs text-muted-foreground">
                                    Sin logo
                                </div>
                                <Button type="button" variant="outline" size="sm" className="w-fit">
                                    Cambiar logo
                                </Button>
                                <p className="text-xs text-muted-foreground">JPG o PNG. Máx. 2MB.</p>
                            </Field>

                            <div className="flex flex-col gap-6">
                                <Field data-invalid={Boolean(errors.name)}>
                                    <FieldLabel htmlFor="name">Nombre de la empresa *</FieldLabel>
                                    <Input
                                        id="name"
                                        placeholder="H-Move"
                                        aria-invalid={Boolean(errors.name)}
                                        {...register("name")}
                                    />
                                    <FieldError errors={[errors.name]} />
                                </Field>
                                <Field data-invalid={Boolean(errors.webUrl)}>
                                    <FieldLabel htmlFor="webUrl">Sitio web *</FieldLabel>
                                    <Input
                                        id="webUrl"
                                        placeholder="https://hmove.com.uy"
                                        aria-invalid={Boolean(errors.webUrl)}
                                        {...register("webUrl")}
                                    />
                                    <FieldError errors={[errors.webUrl]} />
                                </Field>
                            </div>
                        </div>

                        <Field data-invalid={Boolean(errors.description)}>
                            <FieldLabel htmlFor="description">Descripción de la empresa *</FieldLabel>
                            <p className="text-sm text-muted-foreground">
                                Contá qué hace tu empresa, cuál es su propósito y qué la hace única.
                            </p>
                            <Textarea
                                id="description"
                                maxLength={DESCRIPTION_MAX}
                                className="min-h-32"
                                aria-invalid={Boolean(errors.description)}
                                {...register("description")}
                            />
                            <p className="text-right text-xs text-muted-foreground">
                                {description.length}/{DESCRIPTION_MAX}
                            </p>
                            <FieldError errors={[errors.description]} />
                        </Field>

                        <div className="grid gap-6 sm:grid-cols-2">
                            <Field data-invalid={Boolean(errors.industry)}>
                                <FieldLabel htmlFor="industry">Industria *</FieldLabel>
                                <Input
                                    id="industry"
                                    placeholder="Marketing y Publicidad"
                                    aria-invalid={Boolean(errors.industry)}
                                    {...register("industry")}
                                />
                                <FieldError errors={[errors.industry]} />
                            </Field>

                            <Field data-invalid={Boolean(errors.location)}>
                                <FieldLabel htmlFor="location">Ubicación principal *</FieldLabel>
                                <input type="hidden" {...register("location")} />
                                <Select
                                    value={location ?? ""}
                                    onValueChange={(value) =>
                                        register("location").onChange({ target: { value, name: "location" } })
                                    }
                                >
                                    <SelectTrigger id="location" className="w-full" aria-invalid={Boolean(errors.location)}>
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
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2">
                            {/* TODO: sin respaldo en el back */}
                            <Field>
                                <FieldLabel htmlFor="companySize">Tamaño de la empresa</FieldLabel>
                                <Input
                                    id="companySize"
                                    placeholder="11 - 50 empleados"
                                    {...register("companySize")}
                                />
                            </Field>

                            {/* TODO: sin respaldo en el back */}
                            <Field>
                                <FieldLabel htmlFor="foundedYear">Año de fundación</FieldLabel>
                                <Input
                                    id="foundedYear"
                                    type="number"
                                    placeholder="2018"
                                    {...register("foundedYear")}
                                />
                            </Field>
                        </div>

                        <Field>
                            <FieldLabel>Redes sociales (opcionales)</FieldLabel>
                            <p className="text-sm text-muted-foreground">
                                Sumá tus redes para que los estudiantes conozcan más sobre tu empresa.
                            </p>
                            <div className="flex flex-col gap-3">
                                <SocialField
                                    id="linkedinUrl"
                                    label="LinkedIn"
                                    placeholder="https://linkedin.com/company/tuempresa"
                                    {...register("linkedinUrl")}
                                />
                                {/* TODO: sin respaldo en el back */}
                                <SocialField
                                    id="instagramUrl"
                                    label="Instagram"
                                    placeholder="https://instagram.com/tuempresa"
                                    {...register("instagramUrl")}
                                />
                                {/* TODO: sin respaldo en el back */}
                                <SocialField
                                    id="facebookUrl"
                                    label="Facebook"
                                    placeholder="https://facebook.com/tuempresa"
                                    {...register("facebookUrl")}
                                />
                            </div>
                        </Field>

                        {error && <FieldError>{error}</FieldError>}

                        <Button type="submit" disabled={isLoading} className="w-fit">
                            {isLoading ? "Guardando..." : "Guardar cambios"}
                        </Button>
                    </FieldGroup>
                </CardContent>
            </Card>
        </form>
    );
}

/** Placeholder de `CompanyProfileForm` mientras se resuelve la carga inicial
 *  del perfil (GET /company?userId=), cuando el back esté conectado. */
export function CompanyProfileFormSkeleton() {
    return (
        <Card className="lg:col-span-2">
            <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-72" />
            </CardHeader>
            <CardContent className="space-y-6">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-10 w-full" />
            </CardContent>
        </Card>
    );
}