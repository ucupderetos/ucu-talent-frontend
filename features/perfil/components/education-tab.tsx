"use client";

// Pestaña "Formación académica" de Mi perfil: lista de `Education` +
// alta/edición en un Dialog. No hay campo plano "carrera" (AGENTS.md): cada
// entrada apunta a un `Degree` (MOCK_DEGREES) y tiene su propio `degreeLevel`.

import { useState } from "react";
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
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateEducation,
  useDegrees,
  useDeleteEducation,
  useUpdateEducation,
} from "@/features/perfil/hooks/use-education";
import type { EducationInput } from "@/features/perfil/types";
import type { Degree, DegreeLevel, Education } from "@/types";

const DEGREE_LEVEL_LABEL: Record<DegreeLevel, string> = {
  TECNICATURA: "Tecnicatura",
  LICENCIATURA: "Licenciatura",
  GRADO: "Grado",
  POSGRADO: "Posgrado",
  DOCTORADO: "Doctorado",
};

const dateFormatter = new Intl.DateTimeFormat("es-UY", { month: "short", year: "numeric" });

function formatRange(startDate: string, endDate: string | null): string {
  const start = dateFormatter.format(new Date(startDate));
  const end = endDate ? dateFormatter.format(new Date(endDate)) : "En curso";
  return `${start} — ${end}`;
}

function toDateInputValue(iso: string | null): string {
  return iso ? iso.slice(0, 10) : "";
}

function degreeName(degrees: readonly Degree[], degreeId: string): string {
  return degrees.find((d) => d.degreeId === degreeId)?.name ?? "—";
}

interface FormValues {
  degreeLevel: DegreeLevel | "";
  degreeId: string;
  institution: string;
  startDate: string;
  isCurrent: boolean;
  endDate: string;
  description: string;
}

function toFormValues(item?: Education): FormValues {
  return {
    degreeLevel: item?.degreeLevel ?? "",
    degreeId: item?.degreeId ?? "",
    institution: item?.institution ?? "",
    startDate: toDateInputValue(item?.startDate ?? null),
    isCurrent: item ? item.endDate === null : true,
    endDate: toDateInputValue(item?.endDate ?? null),
    description: item?.description ?? "",
  };
}

function toInput(values: FormValues): EducationInput {
  return {
    degreeLevel: values.degreeLevel as DegreeLevel,
    degreeId: values.degreeId,
    institution: values.institution.trim() || undefined,
    description: values.description.trim() || undefined,
    startDate: values.startDate,
    endDate: values.isCurrent ? null : values.endDate || null,
  };
}

export function EducationTab({
  studentProfileId,
  education,
}: {
  studentProfileId: string;
  education: Education[];
}) {
  const [items, setItems] = useState(education);
  const [editingItem, setEditingItem] = useState<Education | "new" | null>(null);
  const degrees = useDegrees();

  const { createEducation } = useCreateEducation();
  const { updateEducation } = useUpdateEducation();
  const { deleteEducation } = useDeleteEducation();

  async function handleSubmit(values: FormValues) {
    const input = toInput(values);

    if (editingItem === "new") {
      const created = await createEducation({ ...input, studentProfileId });
      setItems((current) => [created, ...current]);
      toast.success("Formación académica agregada.");
    } else if (editingItem) {
      const updated = await updateEducation({
        ...input,
        educationId: editingItem.educationId,
        studentProfileId,
      });
      setItems((current) =>
        current.map((item) => (item.educationId === updated.educationId ? updated : item)),
      );
      toast.success("Formación académica actualizada.");
    }

    setEditingItem(null);
  }

  async function handleDelete(item: Education) {
    await deleteEducation({ educationId: item.educationId, studentProfileId });
    setItems((current) => current.filter((i) => i.educationId !== item.educationId));
    toast.success("Formación académica eliminada.");
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button type="button" onClick={() => setEditingItem("new")}>
          <PlusIcon />
          Agregar formación
        </Button>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="Todavía no cargaste formación académica"
          description="Agregá tus carreras para que las empresas conozcan tu perfil académico."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <Card key={item.educationId}>
              <CardContent className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium">{degreeName(degrees, item.degreeId)}</p>
                  <p className="text-sm text-muted-foreground">
                    {DEGREE_LEVEL_LABEL[item.degreeLevel]}
                    {item.institution ? ` · ${item.institution}` : ""}
                  </p>
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
                    aria-label="Editar formación"
                    onClick={() => setEditingItem(item)}
                  >
                    <PencilIcon />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Eliminar formación"
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

      <EducationDialog
        item={editingItem}
        onOpenChange={(open) => !open && setEditingItem(null)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

function EducationDialog({
  item,
  onOpenChange,
  onSubmit,
}: {
  item: Education | "new" | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: FormValues) => Promise<void>;
}) {
  const form = useForm<FormValues>({
    values: toFormValues(item === "new" ? undefined : (item ?? undefined)),
  });

  const isCurrent = useWatch({ control: form.control, name: "isCurrent" });
  const degreeId = useWatch({ control: form.control, name: "degreeId" });
  const degrees = useDegrees();

  // Institución obligatoria cuando la carrera elegida NO es de la UCU
  // (docs/ENDPOINTS.md, sección 4) — el backend la valida igual, esto solo
  // adelanta el error en el form.
  const selectedDegree = degrees.find((d) => d.degreeId === degreeId);
  const institutionRequired = Boolean(selectedDegree && !selectedDegree.isUcu);

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
            <DialogTitle>{item === "new" ? "Agregar formación" : "Editar formación"}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <Field data-invalid={Boolean(form.formState.errors.degreeId)}>
              <FieldLabel htmlFor="ed-degree">Carrera *</FieldLabel>
              <Controller
                control={form.control}
                name="degreeId"
                rules={{ required: true }}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="ed-degree" className="w-full">
                      <SelectValue placeholder="Seleccioná una carrera" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {degrees.map((degree) => (
                        <SelectItem key={degree.degreeId} value={degree.degreeId}>
                          {degree.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError errors={[form.formState.errors.degreeId]} />
            </Field>

            {institutionRequired && (
              <Field data-invalid={Boolean(form.formState.errors.institution)}>
                <FieldLabel htmlFor="ed-institution">Institución *</FieldLabel>
                <Input
                  id="ed-institution"
                  placeholder="Nombre de la institución"
                  aria-invalid={Boolean(form.formState.errors.institution)}
                  {...form.register("institution", {
                    required: "Ingresá la institución: la carrera elegida no es de la UCU.",
                  })}
                />
                <FieldError errors={[form.formState.errors.institution]} />
              </Field>
            )}

            <Field data-invalid={Boolean(form.formState.errors.degreeLevel)}>
              <FieldLabel htmlFor="ed-level">Nivel *</FieldLabel>
              <Controller
                control={form.control}
                name="degreeLevel"
                rules={{ required: true }}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="ed-level" className="w-full">
                      <SelectValue placeholder="Seleccioná un nivel" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {Object.entries(DEGREE_LEVEL_LABEL).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError errors={[form.formState.errors.degreeLevel]} />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field data-invalid={Boolean(form.formState.errors.startDate)}>
                <FieldLabel htmlFor="ed-start">Desde *</FieldLabel>
                <Input
                  id="ed-start"
                  type="date"
                  aria-invalid={Boolean(form.formState.errors.startDate)}
                  {...form.register("startDate", { required: true })}
                />
                <FieldError errors={[form.formState.errors.startDate]} />
              </Field>
              <Field>
                <FieldLabel htmlFor="ed-end">Hasta</FieldLabel>
                <Input id="ed-end" type="date" disabled={isCurrent} {...form.register("endDate")} />
              </Field>
            </div>

            <Controller
              control={form.control}
              name="isCurrent"
              render={({ field }) => (
                <label className="flex w-fit items-center gap-2 text-sm">
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  En curso
                </label>
              )}
            />

            <Field>
              <FieldLabel htmlFor="ed-description">Descripción</FieldLabel>
              <Textarea id="ed-description" className="min-h-20" {...form.register("description")} />
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
