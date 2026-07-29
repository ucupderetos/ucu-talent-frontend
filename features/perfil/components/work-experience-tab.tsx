"use client";

// Pestaña "Experiencia laboral" de Mi perfil: lista de `WorkExperience` +
// alta/edición en un Dialog (todos los campos son opcionales en el wire, ver
// WorkExperienceInput en features/perfil/types.ts). Baja sin confirmación:
// es una lista propia del alumno sobre datos mock, no una acción irreversible
// contra el backend real todavía.

import { forwardRef, useImperativeHandle, useState } from "react";
import { PencilIcon, PlusIcon, TrashIcon } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/layout/empty-state";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateWorkExperience,
  useDeleteWorkExperience,
  useUpdateWorkExperience,
} from "@/features/perfil/hooks/use-work-experience";
import type { WorkExperienceInput } from "@/features/perfil/types";
import type { WorkExperience } from "@/types";

const dateFormatter = new Intl.DateTimeFormat("es-UY", { month: "short", year: "numeric" });

function formatRange(startDate: string | null, endDate: string | null): string {
  const start = startDate ? dateFormatter.format(new Date(startDate)) : "Sin fecha";
  const end = endDate ? dateFormatter.format(new Date(endDate)) : "Actualidad";
  return `${start} — ${end}`;
}

function toDateInputValue(iso: string | null): string {
  return iso ? iso.slice(0, 10) : "";
}

interface FormValues {
  company: string;
  position: string;
  startDate: string;
  isCurrent: boolean;
  endDate: string;
  description: string;
}

function toFormValues(item?: WorkExperience): FormValues {
  return {
    company: item?.company ?? "",
    position: item?.position ?? "",
    startDate: toDateInputValue(item?.startDate ?? null),
    isCurrent: item ? item.endDate === null : true,
    endDate: toDateInputValue(item?.endDate ?? null),
    description: item?.description ?? "",
  };
}

function toInput(values: FormValues): WorkExperienceInput {
  return {
    company: values.company.trim() || undefined,
    position: values.position.trim() || undefined,
    startDate: values.startDate || undefined,
    endDate: values.isCurrent ? null : values.endDate || null,
    description: values.description.trim() || undefined,
  };
}

export interface WorkExperienceTabHandle {
  openCreateDialog: () => void;
}

interface WorkExperienceTabProps {
  studentProfileId: string;
  workExperience: WorkExperience[];
  hideAddButton?: boolean;
}

export const WorkExperienceTab = forwardRef<WorkExperienceTabHandle, WorkExperienceTabProps>(
  function WorkExperienceTab({ studentProfileId, workExperience, hideAddButton }, ref) {
    const [items, setItems] = useState(workExperience);
    const [editingItem, setEditingItem] = useState<WorkExperience | "new" | null>(null);

    const { createWorkExperience } = useCreateWorkExperience();
    const { updateWorkExperience } = useUpdateWorkExperience();
    const { deleteWorkExperience } = useDeleteWorkExperience();

    useImperativeHandle(ref, () => ({
      openCreateDialog: () => setEditingItem("new"),
    }));

    async function handleSubmit(values: FormValues) {
      const input = toInput(values);

      if (editingItem === "new") {
        const created = await createWorkExperience({ ...input, studentProfileId });
        setItems((current) => [created, ...current]);
        toast.success("Experiencia laboral agregada.");
      } else if (editingItem) {
        const updated = await updateWorkExperience({
          ...input,
          workExperienceId: editingItem.workExperienceId,
          studentProfileId,
        });
        setItems((current) =>
          current.map((item) =>
            item.workExperienceId === updated.workExperienceId ? updated : item,
          ),
        );
        toast.success("Experiencia laboral actualizada.");
      }

      setEditingItem(null);
    }

    async function handleDelete(item: WorkExperience) {
      await deleteWorkExperience({ workExperienceId: item.workExperienceId, studentProfileId });
      setItems((current) => current.filter((i) => i.workExperienceId !== item.workExperienceId));
      toast.success("Experiencia laboral eliminada.");
    }

    return (
      <div className="flex flex-col gap-4">
        {!hideAddButton && (
          <div className="flex justify-end">
            <Button type="button" onClick={() => setEditingItem("new")}>
              <PlusIcon />
              Agregar experiencia
            </Button>
          </div>
        )}

        {items.length === 0 ? (
          <EmptyState
            title="Todavía no cargaste experiencia laboral"
            description="Agregá tus trabajos anteriores para que las empresas conozcan tu trayectoria."
          />
        ) : (
          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <Card key={item.workExperienceId}>
                <CardContent className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium">{item.position || "Sin cargo"}</p>
                    <p className="text-sm text-muted-foreground">{item.company || "Sin empresa"}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatRange(item.startDate, item.endDate)}
                    </p>
                    {item.description && (
                      <p className="mt-2 whitespace-pre-line text-sm text-foreground/90">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Editar experiencia"
                      onClick={() => setEditingItem(item)}
                    >
                      <PencilIcon />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Eliminar experiencia"
                      onClick={() => handleDelete(item)}
                    >
                      <TrashIcon />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <WorkExperienceDialog
          item={editingItem}
          onOpenChange={(open) => !open && setEditingItem(null)}
          onSubmit={handleSubmit}
        />
      </div>
    );
  },
);

function WorkExperienceDialog({
  item,
  onOpenChange,
  onSubmit,
}: {
  item: WorkExperience | "new" | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: FormValues) => Promise<void>;
}) {
  const form = useForm<FormValues>({
    values: toFormValues(item === "new" ? undefined : (item ?? undefined)),
  });

  const isCurrent = useWatch({ control: form.control, name: "isCurrent" });

  return (
    <Dialog open={item !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form
          onSubmit={form.handleSubmit(async (values) => {
            await onSubmit(values);
          })}
          noValidate
        >
          <DialogHeader>
            <DialogTitle>{item === "new" ? "Agregar experiencia" : "Editar experiencia"}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <Field>
              <FieldLabel htmlFor="we-position">Cargo</FieldLabel>
              <Input id="we-position" {...form.register("position")} />
            </Field>

            <Field>
              <FieldLabel htmlFor="we-company">Empresa</FieldLabel>
              <Input id="we-company" {...form.register("company")} />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel htmlFor="we-start">Desde</FieldLabel>
                <Input id="we-start" type="date" {...form.register("startDate")} />
              </Field>
              <Field>
                <FieldLabel htmlFor="we-end">Hasta</FieldLabel>
                <Input id="we-end" type="date" disabled={isCurrent} {...form.register("endDate")} />
              </Field>
            </div>

            <Controller
              control={form.control}
              name="isCurrent"
              render={({ field }) => (
                <label className="flex w-fit items-center gap-2 text-sm">
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  Trabajo actual
                </label>
              )}
            />

            <Field>
              <FieldLabel htmlFor="we-description">Descripción</FieldLabel>
              <Textarea id="we-description" className="min-h-24" {...form.register("description")} />
            </Field>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Guardar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
