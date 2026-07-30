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

import { CONTRACT_TYPES } from "@/lib/contract-types";
import { DEPARTMENTS } from "@/lib/departments";
import { SALARY_AMOUNT_PATTERN, SALARY_CURRENCIES } from "@/lib/salary";
import type { Modality, Department } from "@/types";

const TITLE_MAX = 100;

// satisfies (no `as`): si Modality gana/pierde un valor en @/types, esto rompe
// la build en vez de quedar desincronizado en silencio. `CONTRACT_TYPES` sigue
// el mismo criterio pero vive centralizado en `lib/contract-types.ts`.
const MODALITIES = ["PRESENCIAL", "HIBRIDO", "REMOTO"] as const satisfies readonly Modality[];

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
//
// El salario se carga estructurado: moneda + monto desde + monto hasta
// (opcional), ver `lib/salary.ts`. A diferencia de `edit-job-form.tsx`, que
// además soporta un modo "texto libre" para rescatar valores legados no
// numéricos ("A convenir"), al CREAR no hay valor previo que preservar, así
// que se exige siempre el formato estructurado. El wire
// (`CreateVacancyRequest.salary`) sigue siendo un único `string`, armado
// recién al enviar (ver `use-publish-job.ts`). Los campos de monto son
// opcionales a nivel de tipo y se exigen en el `superRefine` de abajo.
const jobFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Ingresá el título del puesto.")
      .max(TITLE_MAX, `Máximo ${TITLE_MAX} caracteres.`),
    areaId: z.string().trim().min(1, "Seleccioná un área."),
    contractType: z.enum(CONTRACT_TYPES, "Seleccioná un tipo de contrato."),
    modality: z.enum(MODALITIES, "Seleccioná una modalidad."),
    location: z.enum(DEPARTMENTS as [Department, ...Department[]], {
      message: "Seleccioná un departamento.",
    }),
    description: z.string().trim().min(1, "Ingresá la descripción del puesto."),
    requirements: z.string().trim().min(1, "Ingresá los requisitos del puesto."),
    salaryCurrency: z.enum(SALARY_CURRENCIES).optional(),
    salaryMin: z.string().trim().optional(),
    salaryMax: z.string().trim().optional(),
    publicationDate: z.string().min(1, "Ingresá la fecha de publicación."),
    closingDate: z.string().min(1, "Ingresá la fecha de cierre."),
  })
  .refine(
    (data) => !data.publicationDate || !data.closingDate || data.closingDate >= data.publicationDate,
    { message: "La fecha de cierre no puede ser anterior a la de publicación.", path: ["closingDate"] },
  )
  .superRefine((data, ctx) => {
    if (!data.salaryCurrency) {
      ctx.addIssue({ code: "custom", path: ["salaryCurrency"], message: "Seleccioná una moneda." });
    }
    if (!data.salaryMin || !SALARY_AMOUNT_PATTERN.test(data.salaryMin)) {
      ctx.addIssue({
        code: "custom",
        path: ["salaryMin"],
        message: "Ingresá un monto mínimo válido.",
      });
    }
    if (data.salaryMax && !SALARY_AMOUNT_PATTERN.test(data.salaryMax)) {
      ctx.addIssue({ code: "custom", path: ["salaryMax"], message: "Ingresá un monto válido." });
    }
    if (
      data.salaryMin &&
      data.salaryMax &&
      SALARY_AMOUNT_PATTERN.test(data.salaryMin) &&
      SALARY_AMOUNT_PATTERN.test(data.salaryMax) &&
      parseFloat(data.salaryMax.replace(",", ".")) < parseFloat(data.salaryMin.replace(",", "."))
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["salaryMax"],
        message: "El monto máximo debe ser mayor o igual al mínimo.",
      });
    }
  });

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
      salaryCurrency: "UYU",
      salaryMin: "",
      salaryMax: "",
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