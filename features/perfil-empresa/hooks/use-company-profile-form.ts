"use client";

// Estado del formulario de perfil de empresa (MER: `Company`).
//
// ⚠️ Actualizado contra el MER — ver AGENTS.md → "Las tres fuentes y su
// orden de precedencia". Ya no hay campos "solo UI" sin respaldo: todo lo
// que se pide acá existe en `Company`. La única pieza pendiente real es la
// subida de logo (A-11: no hay endpoint de upload todavía).

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { DEPARTMENTS, DESCRIPTION_MAX } from "@/features/perfil-empresa/types";

// Reglas de validación. Reflejan los campos de `Company` en el MER.
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

export function useCompanyProfileForm() {
  return useForm<CompanyProfileFormValues>({
    resolver: zodResolver(companyProfileSchema),
    defaultValues: {
      razonSocial: "",
      rut: "",
      phoneNumber: "",
      industry: "",
      description: "",
      webUrl: "",
      linkedinUrl: "",
      location: undefined,
      logoUrl: "",
    },
  });
}