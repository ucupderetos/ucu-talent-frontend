"use client";

// Estado compartido del wizard de creación de oferta. Vive en el layout.tsx
// de app/(empresa)/crear-oferta/, así sobrevive a la navegación entre los
// 3 pasos (Next no remonta el layout al navegar entre rutas hijas).
//
// TODO: RF-PUE-01 pide "Guardar borrador". Hoy el estado solo vive en memoria
// del navegador — se pierde si se recarga la página. Cuando el back tenga un
// endpoint de borradores, acá se agrega la persistencia real.

import { createContext, useContext, type ReactNode } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";

// TODO: definir el schema completo de zod cuando armemos los campos del
// Paso 1 — por ahora, un placeholder mínimo para no bloquear la estructura.
export interface CreateJobFormValues {
  name: string;
}

const CreateJobFormContext = createContext<UseFormReturn<CreateJobFormValues> | null>(null);

export function CreateJobFormProvider({ children }: { children: ReactNode }) {
  const form = useForm<CreateJobFormValues>({
    defaultValues: { name: "" },
  });

  return (
    <CreateJobFormContext.Provider value={form}>
      {children}
    </CreateJobFormContext.Provider>
  );
}

/** Acceso al form compartido desde cualquier paso del wizard. Tira error si
 *  se usa fuera del layout de crear/ — señal de un import mal ubicado. */
export function useCreateJobForm() {
  const context = useContext(CreateJobFormContext);
  if (!context) {
    throw new Error("useCreateJobForm debe usarse dentro de CreateJobFormProvider");
  }
  return context;
}