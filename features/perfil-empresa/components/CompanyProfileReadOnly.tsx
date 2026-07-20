"use client";

import { useWatch, type UseFormReturn } from "react-hook-form";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { CompanyProfileFormValues } from "@/features/perfil-empresa/hooks/use-company-profile-form";
import { DEPARTMENT_LABELS } from "@/features/perfil-empresa/types";

/** Un campo en modo lectura: label arriba, valor abajo (o un placeholder gris
 *  si está vacío). Mismo layout visual que un Field, pero sin bordes de input. */
function ReadOnlyField({
    label,
    value,
    placeholder = "Sin completar",
}: {
    label: string;
    value: string | undefined;
    placeholder?: string;
}) {
    return (
        <div className="space-y-1">
            <p className="text-sm font-medium">{label}</p>
            <p className={value ? "text-sm" : "text-sm text-muted-foreground italic"}>
                {value || placeholder}
            </p>
        </div>
    );
}

export function CompanyProfileReadOnly({
    form,
    onEdit,
    logoPreviewUrl,
}: {
    form: UseFormReturn<CompanyProfileFormValues>;
    onEdit: () => void;
    logoPreviewUrl: string | null;
}) {
    const values = useWatch({ control: form.control });

    return (
        <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-start justify-between">
                <div>
                    <CardTitle>Información general</CardTitle>
                    <CardDescription>Los datos actuales de tu empresa.</CardDescription>
                </div>
                <Button type="button" variant="outline" onClick={onEdit}>
                    Editar perfil
                </Button>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Logo — TODO: sin respaldo en el back */}
                <div className="space-y-1">
                    <p className="text-sm font-medium">Logo de la empresa</p>
                    <div className="flex size-24 items-center justify-center overflow-hidden rounded-md border text-xs text-muted-foreground">
                        {logoPreviewUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element -- preview local (blob:)
                            <img src={logoPreviewUrl} alt="Logo de la empresa" className="size-full object-cover" />
                        ) : (
                            "Sin logo"
                        )}
                    </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                    <ReadOnlyField label="Nombre de la empresa" value={values.name} />
                    <ReadOnlyField label="Sitio web" value={values.webUrl} />
                </div>

                <ReadOnlyField label="Descripción" value={values.description} />

                <div className="grid gap-6 sm:grid-cols-2">
                    <ReadOnlyField label="Industria" value={values.industry} />
                    <ReadOnlyField
                        label="Ubicación principal"
                        value={values.location ? DEPARTMENT_LABELS[values.location] : undefined}
                    />
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                    <ReadOnlyField label="Tamaño de la empresa" value={values.companySize} />
                    <ReadOnlyField label="Año de fundación" value={values.foundedYear} />
                </div>

                <div className="space-y-1">
                    <p className="text-sm font-medium">Redes sociales</p>
                    {values.linkedinUrl || values.instagramUrl || values.facebookUrl ? (
                        <ul className="space-y-1 text-sm text-muted-foreground">
                            {values.linkedinUrl && <li>{values.linkedinUrl}</li>}
                            {values.instagramUrl && <li>{values.instagramUrl}</li>}
                            {values.facebookUrl && <li>{values.facebookUrl}</li>}
                        </ul>
                    ) : (
                        <p className="text-sm italic text-muted-foreground">Sin completar</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

/** Placeholder mientras se resuelve la carga inicial del perfil
 *  (GET /company?userId=), cuando el back esté conectado. */
export function CompanyProfileReadOnlySkeleton() {
    return (
        <Card className="lg:col-span-2">
            <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-72" />
            </CardHeader>
            <CardContent className="space-y-6">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-20 w-full" />
            </CardContent>
        </Card>
    );
}