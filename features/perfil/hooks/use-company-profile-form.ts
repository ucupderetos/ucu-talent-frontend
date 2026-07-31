"use client";

// Estado del formulario de perfil de empresa (MER: `Company`).
//
// ⚠️ Alineado al modelo de vista `CompanyProfile` (features/perfil/types.ts),
// que refleja el MER con `legalName` en inglés (ver `docs/agents/language-conventions.md`). Se siembra con
// `useCompanyProfile()` — que trae la `Company` REAL del backend
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
import { isExternalUrl } from "@/lib/urls";

const companyProfileSchema = z.object({
  legalName: z.string().trim().min(1, "Ingresá la razón social."),
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
  // Vacío sigue siendo válido (a diferencia de `webUrl`, este campo no es
  // obligatorio), pero si hay algo tiene que ser una URL: el perfil lo muestra
  // como link clickeable y lo ven los alumnos.
  linkedinUrl: z
    .string()
    .trim()
    .refine((value) => value === "" || isExternalUrl(value), {
      message: "Ingresá una URL válida.",
    }),
  location: z.enum(DEPARTMENTS as [Department, ...Department[]], "Seleccioná un departamento."),
});

export type CompanyProfileFormValues = z.infer<typeof companyProfileSchema>;

const EMPTY_VALUES: CompanyProfileFormValues = {
  legalName: "",
  industry: "",
  description: "",
  webUrl: "",
  linkedinUrl: "",
  location: undefined as unknown as Department,
};

export function useCompanyProfileForm() {
  const { profile, isLoading, isError } = useCompanyProfile();
  const [mode, setMode] = useState<"view" | "edit">("view");

  const form = useForm<CompanyProfileFormValues>({
    resolver: zodResolver(companyProfileSchema),
    defaultValues: EMPTY_VALUES,
  });

  // Siembra el form (RHF, sistema externo a React) con la empresa cuando llega
  // del backend o se refresca tras un guardado. Todos los campos se persisten,
  // así que el refetch confirma lo guardado sin pisar nada editado a mano.
  useEffect(() => {
    if (profile) form.reset(profile);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- form es estable (RHF), no va en deps
  }, [profile]);

  function startEditing() {
    setMode("edit");
  }

  function commitSave() {
    // El PUT ya persistió y se invalidó la query; el form conserva lo que se
    // envió y el refetch lo reconfirma. Solo hay que volver a "view".
    setMode("view");
  }

  function cancelEditing() {
    if (profile) form.reset(profile);
    setMode("view");
  }

  return { form, mode, startEditing, commitSave, cancelEditing, isLoading, isError };
}
