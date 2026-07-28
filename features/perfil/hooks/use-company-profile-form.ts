"use client";

// Estado del formulario de perfil de empresa (MER: `Company`).
//
// ⚠️ Alineado al modelo de vista `CompanyProfile` (features/perfil/types.ts),
// que refleja el MER con `legalName` en inglés (AGENTS.md). Se siembra con
// `useCompanyProfile()` — que hoy trae la `Company` REAL del backend
// (`GET /company?userId=`), asíncrono: mientras carga, `profile` es undefined
// y el form arranca vacío (la vista muestra un skeleton, no el form vacío).

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { Department } from "@/types";

import { COMPANY_DESCRIPTION_MAX } from "@/features/perfil/types";
import { useCompanyProfile } from "@/features/perfil/hooks/use-company-profile";
import { DEPARTMENTS } from "@/lib/departments";

const companyProfileSchema = z.object({
  legalName: z.string().trim().min(1, "Ingresá la razón social."),
  rut: z.string().trim().min(1, "Ingresá el RUT."),
  phoneNumber: z.string().trim().min(1, "Ingresá un teléfono."),
  industry: z.string().trim().min(1, "Ingresá la industria."),
  description: z
    .string()
    .trim()
    .min(1, "Ingresá una descripción.")
    .max(COMPANY_DESCRIPTION_MAX, `Máximo ${COMPANY_DESCRIPTION_MAX} caracteres.`),
  webUrl: z
    .string()
    .trim()
    .min(1, "Ingresá el sitio web.")
    .pipe(z.url("Ingresá una URL válida.")),
  linkedinUrl: z.string().trim(),
  location: z.enum(DEPARTMENTS as [Department, ...Department[]], "Seleccioná un departamento."),
  // A-11: sin endpoint de upload todavía — string libre por ahora.
  logoUrl: z.string(),
});

export type CompanyProfileFormValues = z.infer<typeof companyProfileSchema>;

const EMPTY_VALUES: CompanyProfileFormValues = {
  legalName: "",
  rut: "",
  phoneNumber: "",
  industry: "",
  description: "",
  webUrl: "",
  linkedinUrl: "",
  location: undefined as unknown as Department,
  logoUrl: "",
};

export function useCompanyProfileForm() {
  const { profile, isLoading, isError } = useCompanyProfile();
  const [mode, setMode] = useState<"view" | "edit">("view");
  // "Último guardado real": null hasta el primer submit. Antes de eso el form se
  // siembra con lo que trajo el GET; después, con lo último que guardó el
  // usuario. Esto también preserva rut/phoneNumber/logoUrl: la API no los
  // persiste, así que el refetch los volvería a los valores de muestra —
  // committedValues los mantiene como los dejó la persona.
  const [committedValues, setCommittedValues] = useState<CompanyProfileFormValues | null>(null);

  const seedValues = committedValues ?? profile ?? null;

  const form = useForm<CompanyProfileFormValues>({
    resolver: zodResolver(companyProfileSchema),
    defaultValues: EMPTY_VALUES,
  });

  // Sincroniza el form (RHF, sistema externo a React) con la semilla cuando
  // llega del backend o cambia — para esto está pensado useEffect.
  useEffect(() => {
    if (seedValues) form.reset(seedValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- form es estable (RHF), no va en deps
  }, [seedValues]);

  function startEditing() {
    setMode("edit");
  }

  function commitSave(values: CompanyProfileFormValues) {
    setCommittedValues(values);
    form.reset(values);
    setMode("view");
  }

  function cancelEditing() {
    if (seedValues) form.reset(seedValues);
    setMode("view");
  }

  return { form, mode, startEditing, commitSave, cancelEditing, isLoading, isError };
}
