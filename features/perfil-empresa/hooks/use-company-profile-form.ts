"use client";

// Estado del formulario de perfil de empresa (MER: `Company`).
//
// ⚠️ Actualizado contra el MER — ver AGENTS.md → "Las tres fuentes y su
// orden de precedencia". Ya no hay campos "solo UI" sin respaldo: todo lo
// que se pide acá existe en `Company`. La única pieza pendiente real es la
// subida de logo (A-11: no hay endpoint de upload todavía, logoUrl es texto).

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { DEPARTMENTS, DESCRIPTION_MAX } from "@/features/perfil-empresa/types";

const companyProfileSchema = z.object({
  razonSocial: z.string().trim().min(1, "Ingresá la razón social."),
  rut: z.string().trim().min(1, "Ingresá el RUT."),
  phoneNumber: z.string().trim().min(1, "Ingresá un teléfono."),
  industry: z.string().trim().min(1, "Ingresá la industria."),
  description: z
    .string()
    .trim()
    .min(1, "Ingresá una descripción.")
    .max(DESCRIPTION_MAX, `Máximo ${DESCRIPTION_MAX} caracteres.`),
  webUrl: z
    .string()
    .trim()
    .min(1, "Ingresá el sitio web.")
    .pipe(z.url("Ingresá una URL válida.")),
  linkedinUrl: z.string().trim(),
  location: z.enum(DEPARTMENTS, "Seleccioná un departamento."),
  // A-11: sin endpoint de upload todavía — string libre por ahora.
  logoUrl: z.string(),
});

export type CompanyProfileFormValues = z.infer<typeof companyProfileSchema>;

const emptyValues: CompanyProfileFormValues = {
  razonSocial: "",
  rut: "",
  phoneNumber: "",
  industry: "",
  description: "",
  webUrl: "",
  linkedinUrl: "",
  location: undefined as unknown as CompanyProfileFormValues["location"],
  logoUrl: "",
};

export function useCompanyProfileForm() {
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [savedValues, setSavedValues] = useState<CompanyProfileFormValues>(emptyValues);

  const form = useForm<CompanyProfileFormValues>({
    resolver: zodResolver(companyProfileSchema),
    defaultValues: emptyValues,
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