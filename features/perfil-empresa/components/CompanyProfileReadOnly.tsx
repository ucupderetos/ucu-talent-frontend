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
import type { CompanyProfileFormValues } from "@/features/perfil-empresa/hooks/use-company-profile-form";
import { DEPARTMENT_LABELS } from "@/features/perfil-empresa/types";

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
}: {
    form: UseFormReturn<CompanyProfileFormValues>;
    onEdit: () => void;
}) {
    const values = useWatch({ control: form.control });

    return (
        <Card>
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
                {/* A-11: sin endpoint de upload todavía */}
                {/* A-11: sin endpoint de upload todavía */}
                {/* A-11: sin endpoint de upload todavía */}
                <div className="space-y-1">
                    <p className="text-sm font-medium">Logo</p>
                    <div className="flex size-24 items-center justify-center overflow-hidden rounded-md border text-xs text-muted-foreground">
                        {values.logoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element -- URL de texto, sin endpoint de upload todavía
                            <img src={values.logoUrl} alt="Logo de la empresa" className="size-full object-cover" />
                        ) : (
                            "Sin logo"
                        )}
                    </div>
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                    <ReadOnlyField label="Razón social" value={values.razonSocial} />
                    <ReadOnlyField label="RUT" value={values.rut} />
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                    <ReadOnlyField label="Teléfono" value={values.phoneNumber} />
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

                <ReadOnlyField label="LinkedIn" value={values.linkedinUrl} />
            </CardContent>
        </Card>
    );
}