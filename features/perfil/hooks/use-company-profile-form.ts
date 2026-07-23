"use client";

// Estado del formulario de perfil de empresa (MER/wire: `Company`).
//
// ⚠️ Alineado a docs/ENDPOINTS.md (fuente #3, gana sobre el MER): sin
// legalName/rut/phoneNumber/logoUrl, que el back real no expone en Company.
// Se siembra con useCurrentCompany() (GET /company?userId=) — mientras esa
// query está cargando, `company` es null y el form no tiene defaultValues
// reales todavía (ver isLoading que expone este hook).

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { Department } from "@/types";

import { COMPANY_DESCRIPTION_MAX } from "@/features/perfil/types";
import { useCurrentCompany } from "@/features/puestos/hooks/use-current-company";

const DEPARTMENTS: readonly Department[] = [
  "ARTIGAS", "CANELONES", "CERRO_LARGO", "COLONIA", "DURAZNO", "FLORES",
  "FLORIDA", "LAVALLEJA", "MALDONADO", "MONTEVIDEO", "PAYSANDU", "RIO_NEGRO",
  "RIVERA", "ROCHA", "SALTO", "SAN_JOSE", "SORIANO", "TACUAREMBO", "TREINTA_Y_TRES",
];

const DEPARTMENT_LABELS: Record<Department, string> = {
  ARTIGAS: "Artigas", CANELONES: "Canelones", CERRO_LARGO: "Cerro Largo",
  COLONIA: "Colonia", DURAZNO: "Durazno", FLORES: "Flores", FLORIDA: "Florida",
  LAVALLEJA: "Lavalleja", MALDONADO: "Maldonado", MONTEVIDEO: "Montevideo",
  PAYSANDU: "Paysandú", RIO_NEGRO: "Río Negro", RIVERA: "Rivera", ROCHA: "Rocha",
  SALTO: "Salto", SAN_JOSE: "San José", SORIANO: "Soriano",
  TACUAREMBO: "Tacuarembó", TREINTA_Y_TRES: "Treinta y Tres",
};

export { DEPARTMENTS, DEPARTMENT_LABELS };

const companyProfileSchema = z.object({
  name: z.string().trim().min(1, "Ingresá la razón social."),
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
});

export type CompanyProfileFormValues = z.infer<typeof companyProfileSchema>;

const emptyValues: CompanyProfileFormValues = {
  name: "",
  industry: "",
  description: "",
  webUrl: "",
  linkedinUrl: "",
  location: undefined as unknown as Department,
};

export function useCompanyProfileForm() {
  const { company, isLoading: isCompanyLoading } = useCurrentCompany();

  const [mode, setMode] = useState<"view" | "edit">("view");
  // "Último guardado real" para Cancelar: mientras no se hizo ningún submit
  // todavía, es lo que trajo el GET; después de guardar, commitSave lo pisa.
  const [committedValues, setCommittedValues] = useState<CompanyProfileFormValues | null>(null);

  const seedValues = useMemo<CompanyProfileFormValues>(() => {
    if (committedValues) return committedValues;
    if (!company) return emptyValues;
    return {
      name: company.name,
      industry: company.industry,
      description: company.description,
      webUrl: company.webUrl,
      linkedinUrl: company.linkedinUrl,
      location: company.location,
    };
  }, [company, committedValues]);

  const form = useForm<CompanyProfileFormValues>({
    resolver: zodResolver(companyProfileSchema),
    defaultValues: emptyValues,
  });

  // Sincroniza el form (librería externa) con seedValues cuando cambia —
  // esto es exactamente lo que useEffect está pensado para hacer (sincronizar
  // con un sistema externo a React), a diferencia de actualizar estado propio.
  useEffect(() => {
    form.reset(seedValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- form es estable (RHF), no hace falta en deps
  }, [seedValues]);

  function startEditing() {
    setMode("edit");
  }

  function commitSave(values: CompanyProfileFormValues) {
    setCommittedValues(values);
    setMode("view");
  }

  function cancelEditing() {
    form.reset(seedValues);
    setMode("view");
  }

  return { form, mode, startEditing, commitSave, cancelEditing, isLoading: isCompanyLoading };
}