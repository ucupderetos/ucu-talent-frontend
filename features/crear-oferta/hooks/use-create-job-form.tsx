"use client";

// Estado compartido del wizard de creación de oferta. Vive en el layout.tsx
// de app/(empresa)/crear-oferta/, así sobrevive a la navegación entre los
// 3 pasos (Next no remonta el layout al navegar entre rutas hijas).
//
// TODO: RF-PUE-01 pide "Guardar borrador". Hoy el estado solo vive en memoria
// del navegador — se pierde si se recarga la página. Cuando el back tenga un
// endpoint de borradores, acá se agrega la persistencia real.

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { createContext, useContext, useState, type ReactNode } from "react";

// Enum Departamento del back — mismo catálogo que Company.location en
// perfil-empresa/types.ts.
export const DEPARTMENTS = [
  "ARTIGAS", "CANELONES", "CERRO_LARGO", "COLONIA", "DURAZNO", "FLORES",
  "FLORIDA", "LAVALLEJA", "MALDONADO", "MONTEVIDEO", "PAYSANDU", "RIO_NEGRO",
  "RIVERA", "ROCHA", "SALTO", "SAN_JOSE", "SORIANO", "TACUAREMBO", "TREINTA_Y_TRES",
] as const;

export const DEPARTMENT_LABELS: Record<string, string> = {
  ARTIGAS: "Artigas", CANELONES: "Canelones", CERRO_LARGO: "Cerro Largo",
  COLONIA: "Colonia", DURAZNO: "Durazno", FLORES: "Flores", FLORIDA: "Florida",
  LAVALLEJA: "Lavalleja", MALDONADO: "Maldonado", MONTEVIDEO: "Montevideo",
  PAYSANDU: "Paysandú", RIO_NEGRO: "Río Negro", RIVERA: "Rivera", ROCHA: "Rocha",
  SALTO: "Salto", SAN_JOSE: "San José", SORIANO: "Soriano",
  TACUAREMBO: "Tacuarembó", TREINTA_Y_TRES: "Treinta y Tres",
};

// Enum Modality del back.
export const MODALITIES = ["PRESENCIAL", "HIBRIDO", "REMOTO"] as const;

const TITLE_MAX = 100;

// Reglas de validación del Paso 1 (Información básica). Reflejan
// CreateVacancyRequest donde corresponde; los campos sin respaldo en el back
// (vacancies, zone) no tienen validación estricta todavía.
const step1Schema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Ingresá el título del puesto.")
    .max(TITLE_MAX, `Máximo ${TITLE_MAX} caracteres.`),
  areaId: z.string().trim().min(1, "Seleccioná un área."),
  contractType: z.string().trim().min(1, "Seleccioná un tipo de contrato."),
  modality: z.enum(MODALITIES, "Seleccioná una modalidad."),
  location: z.string().optional(),
  // TODO: sin respaldo en el back.
  vacancies: z.string(),
  zone: z.string(),
  // Paso 2: Detalles del puesto.
  description: z.string().trim().min(1, "Ingresá la descripción del puesto."),
  // TODO: el back exige `requirements` como campo obligatorio separado
  // (CreateVacancyRequest.requirements, @NotBlank), pero el wireframe del
  // Paso 2 no lo contempla como campo propio. Confirmar con el equipo si se
  // agrega una sección de "Requisitos" o si description cubre ambos casos.
}).refine(
  (data) => data.modality === "REMOTO" || Boolean(data.location),
  { message: "La ubicación es obligatoria salvo que la modalidad sea remota.", path: ["location"] },
);

export type CreateJobFormValues = z.infer<typeof step1Schema>;

interface CreateJobFormContextValue {
  form: UseFormReturn<CreateJobFormValues>;
  furthestStep: number;
  markStepReached: (step: number) => void;
}

const CreateJobFormContext = createContext<CreateJobFormContextValue | null>(null);

export function CreateJobFormProvider({ children }: { children: ReactNode }) {
  const form = useForm<CreateJobFormValues>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      name: "",
      areaId: "",
      contractType: "",
      modality: undefined,
      location: "",
      vacancies: "1",
      zone: "",
      description: "",
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