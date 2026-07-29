"use client";

// Estado compartido del wizard de creación de oferta. Vive en el layout.tsx
// de app/(empresa)/crear-oferta/, así sobrevive a la navegación entre los
// 3 pasos (Next no remonta el layout al navegar entre rutas hijas).
//
// ⚠️ Alineado a `VacancyInput` (features/puestos/types.ts), que ya refleja
// `CreateVacancyRequest` real del back. `companyId` NO se pide en el form:
// se resuelve con useCurrentCompany() al armar el payload final (ver
// use-publish-job.ts), no lo tipea el usuario.
//
// TODO: RF-PUE-01 pide "Guardar borrador". Hoy el estado solo vive en memoria
// del navegador — se pierde si se recarga la página.

import { zodResolver } from "@hookform/resolvers/zod";
import { createContext, useContext, useState, type ReactNode } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { z } from "zod";

import { DEPARTMENTS } from "@/lib/departments";
import type { ContractType, Modality, Department } from "@/types";

const TITLE_MAX = 100;

// satisfies (no `as`): si Modality/ContractType gana/pierde un valor en
// @/types, esto rompe la build en vez de quedar desincronizado en silencio.
const MODALITIES = ["PRESENCIAL", "HIBRIDO", "REMOTO"] as const satisfies readonly Modality[];

// `ContractType` es un enum real de Backend (`vacancy/ContractType.java`), no
// un string libre — verificado contra el código fuente, no contra
// docs/ENDPOINTS.md (que en ningún lado, ni local ni el del backend, lo
// documentaba como enum).
export const CONTRACT_TYPES = [
  "FULL_TIME",
  "PART_TIME",
  "FREELANCE",
  "PASANTIA",
  "CONTRATO_FIJO",
  "CONTRATO_INDEFINIDO",
  "SUPLENCIA",
  "BECA",
] as const satisfies readonly ContractType[];

// Reglas de validación. Reflejan `VacancyInput` (features/puestos/types.ts),
// sin `companyId` (se agrega al armar el payload, no lo carga el usuario).
//
// `publicationDate`/`closingDate`: el backend las exige como input, no las
// autogenera (`CreateVacancyRequest`, verificado contra el código fuente —
// ninguna versión de docs/ENDPOINTS.md las documentaba). El back valida
// además que `publicationDate` no sea anterior a hoy, que `closingDate` no
// sea anterior a `publicationDate`, y que no pase más de un año entre las
// dos — se replica la parte relevante acá para no depender solo del 400 del
// backend.
const jobFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Ingresá el título del puesto.")
    .max(TITLE_MAX, `Máximo ${TITLE_MAX} caracteres.`),
  areaId: z.string().trim().min(1, "Seleccioná un área."),
  contractType: z.enum(CONTRACT_TYPES, "Seleccioná un tipo de contrato."),
  modality: z.enum(MODALITIES, "Seleccioná una modalidad."),
  location: z.enum(DEPARTMENTS as [Department, ...Department[]]).optional(),
  description: z.string().trim().min(1, "Ingresá la descripción del puesto."),
  requirements: z.string().trim().min(1, "Ingresá los requisitos del puesto."),
  salaryRange: z.string().trim().min(1, "Ingresá el rango salarial."),
  publicationDate: z.string().min(1, "Ingresá la fecha de publicación."),
  closingDate: z.string().min(1, "Ingresá la fecha de cierre."),
}).refine(
  (data) => data.modality === "REMOTO" || Boolean(data.location),
  { message: "La ubicación es obligatoria salvo que la modalidad sea remota.", path: ["location"] },
).refine(
  (data) => !data.publicationDate || !data.closingDate || data.closingDate >= data.publicationDate,
  { message: "La fecha de cierre no puede ser anterior a la de publicación.", path: ["closingDate"] },
);

export type JobFormValues = z.infer<typeof jobFormSchema>;

interface CreateJobFormContextValue {
  form: UseFormReturn<JobFormValues>;
  furthestStep: number;
  markStepReached: (step: number) => void;
}

const CreateJobFormContext = createContext<CreateJobFormContextValue | null>(null);

export function CreateJobFormProvider({ children }: { children: ReactNode }) {
  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      name: "",
      areaId: "",
      contractType: undefined,
      modality: undefined,
      location: undefined,
      description: "",
      requirements: "",
      salaryRange: "",
      publicationDate: "",
      closingDate: "",
    },
  });

  const [furthestStep, setFurthestStep] = useState(1);

  function markStepReached(step: number) {
    setFurthestStep((prev) => Math.max(prev, step));
  }

  return (
    <CreateJobFormContext.Provider value={{ form, furthestStep, markStepReached }}>
      {children}
    </CreateJobFormContext.Provider>
  );
}

export function useCreateJobForm() {
  const context = useContext(CreateJobFormContext);
  if (!context) {
    throw new Error("useCreateJobForm debe usarse dentro de CreateJobFormProvider");
  }
  return context;
}