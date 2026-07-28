"use client";

// Estado del formulario de perfil de empresa (MER: `Company`).
//
// ⚠️ Alineado al modelo de vista `CompanyProfile` (features/perfil/types.ts),
// que ya refleja el MER con `legalName` en inglés (AGENTS.md). Arranca
// sembrado con useCompanyProfile() en vez de vacío, para que ReadOnly y
// Preview se puedan revisar con contenido real (ver review del PR).

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
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

export function useCompanyProfileForm() {
  const seedValues = useCompanyProfile();
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [savedValues, setSavedValues] = useState<CompanyProfileFormValues>(seedValues);

  const form = useForm<CompanyProfileFormValues>({
    resolver: zodResolver(companyProfileSchema),
    defaultValues: seedValues,
  });

  function startEditing() {
    setMode("edit");
  }

  function commitSave(values: CompanyProfileFormValues) {
    setSavedValues(values);
    form.reset(values);
    setMode("view");
  }

  function cancelEditing() {
    form.reset(savedValues);
    setMode("view");
  }

  return { form, mode, startEditing, commitSave, cancelEditing };
}