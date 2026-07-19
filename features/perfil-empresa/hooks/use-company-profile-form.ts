"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { DEPARTMENTS, DESCRIPTION_MAX } from "@/features/perfil-empresa/types";
import { useState } from "react";

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

/**
 * Form compartido de perfil de empresa: se crea una sola vez en `page.tsx` y
 * se pasa por props a `CompanyProfileForm` (que lo registra) y a
 * `CompanyProfilePreview` (que solo lo observa con `useWatch`).
 *
 * TODO: cuando el back esté listo, acá se agrega el GET /company?userId=
 * inicial para precargar `defaultValues` (con `form.reset(data)` en un
 * `useEffect`, por ejemplo).
 */
export function useCompanyProfileForm() {
  const [mode, setMode] = useState<"view" | "edit">("view");

  const form = useForm<CompanyProfileFormValues>({
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
  function startEditing() {
    setMode("edit");
  }

  function stopEditing() {
    setMode("view");
  }

  return { form, mode, startEditing, stopEditing };
}