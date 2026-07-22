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

const TITLE_MAX = 100;

// Enum Modality real (@/types).
export const MODALITIES = ["PRESENCIAL", "HIBRIDO", "REMOTO"] as const;

// Reglas de validación. Reflejan `VacancyInput` (features/puestos/types.ts),
// sin `companyId` (se agrega al armar el payload, no lo carga el usuario).
const jobFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Ingresá el título del puesto.")
    .max(TITLE_MAX, `Máximo ${TITLE_MAX} caracteres.`),
  areaId: z.string().trim().min(1, "Seleccioná un área."),
  contractType: z.string().trim().min(1, "Ingresá el tipo de contrato."),
  modality: z.enum(MODALITIES, "Seleccioná una modalidad."),
  location: z.string().optional(),
  description: z.string().trim().min(1, "Ingresá la descripción del puesto."),
  requirements: z.string().trim().min(1, "Ingresá los requisitos del puesto."),
  salaryRange: z.string().trim().min(1, "Ingresá el rango salarial."),
}).refine(
  (data) => data.modality === "REMOTO" || Boolean(data.location),
  { message: "La ubicación es obligatoria salvo que la modalidad sea remota.", path: ["location"] },
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
      contractType: "",
      modality: undefined,
      location: "",
      description: "",
      requirements: "",
      salaryRange: "",
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

// Re-exportado para los componentes que arman el Select de ubicación —
// mismo catálogo que usa perfil-empresa.
