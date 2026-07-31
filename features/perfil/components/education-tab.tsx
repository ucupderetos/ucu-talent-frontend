"use client";

// Pestaña "Formación académica" de Mi perfil: lista de `Education` +
// alta/edición en un Dialog. No hay campo plano "carrera" (ver
// `docs/agents/folder-structure.md`): cada
// entrada apunta a un `Degree` (catálogo real vía `useDegrees()`, GET /degree)
// y tiene su propio `degreeLevel`.

import { forwardRef, useImperativeHandle, useState } from "react";
import { PencilIcon, PlusIcon, TrashIcon } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
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
import { PROFILE_ITEM_DESCRIPTION_MAX } from "@/features/perfil/types";
import type { EducationInput } from "@/features/perfil/types";
import { ApiError } from "@/lib/api-client";
import { DEGREE_LEVEL_LABELS } from "@/lib/degree-levels";
import { applyFieldErrors } from "@/lib/form-errors";
import type { Degree, DegreeLevel, Education } from "@/types";

// ⚠️ `LICENCIATURA` y `GRADO` son dos valores REALES y distintos del enum del
// backend (`Education.DegreeLevel`, docs/ENDPOINTS.md) — no se puede fusionar
// ni sacar uno de los dos acá, un `PUT`/`POST` con un valor inventado rompe
// contra la API. Lo que sí generaba la confusión reportada en QA ("Licenciatura
// y grado es lo mismo, no hay campo de Ingeniería"): las carreras de Ingeniería
// SÍ están en el catálogo real de `GET /degree` (Ingeniería Civil, Industrial,
// en Informática, etc. — confirmado contra el endpoint), lo que faltaba era
// aclarar que esas carreras van con nivel "Grado", no "Licenciatura" (en
// Uruguay el título de Ingeniero es un grado, no una licenciatura) — de ahí el
// texto de ayuda debajo del selector, no un cambio del enum.

const EDUCATION_KNOWN_FIELDS = new Set([
  "degreeId",
  "degreeLevel",
  "institution",
  "startDate",
  "endDate",
  "description",
]);

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

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

export interface EducationTabHandle {
  openCreateDialog: () => void;
}

interface EducationTabProps {
  studentProfileId: string;
  education: Education[];
  hideAddButton?: boolean;
}

export const EducationTab = forwardRef<EducationTabHandle, EducationTabProps>(
  function EducationTab({ studentProfileId, education, hideAddButton }, ref) {
    const [items, setItems] = useState(education);
    // `items` empieza como copia de `education` y de ahí en más se actualiza a
    // mano (crear/editar/borrar) para feedback instantáneo. Si `education`
    // cambia por otra vía — el refetch de fondo de TanStack Query tras la
    // invalidación de alguna mutación, u otra pestaña re-sembrando el perfil —
    // esto vuelve a alinear la copia local durante el render (patrón de React
    // para "ajustar estado cuando cambia una prop", no un useEffect: evita el
    // render extra en cascada), para que no quede desincronizada del server
    // state real.
    const [prevEducation, setPrevEducation] = useState(education);
    if (education !== prevEducation) {
      setPrevEducation(education);
      setItems(education);
    }

    const [editingItem, setEditingItem] = useState<Education | "new" | null>(null);
    const [deletingItem, setDeletingItem] = useState<Education | null>(null);
    const degrees = useDegrees();

    const { createEducation } = useCreateEducation();
    const { updateEducation } = useUpdateEducation();
    const { deleteEducation, isLoading: isDeleting } = useDeleteEducation();

    useImperativeHandle(ref, () => ({
      openCreateDialog: () => setEditingItem("new"),
    }));

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

    async function confirmDelete() {
      if (!deletingItem) return;
      await deleteEducation({ educationId: deletingItem.educationId, studentProfileId });
      setItems((current) => current.filter((i) => i.educationId !== deletingItem.educationId));
      toast.success("Formación académica eliminada.");
      setDeletingItem(null);
    }

    return (
      <div className="flex flex-col gap-4">
        {!hideAddButton && (
          <div className="flex justify-end">
            <Button type="button" onClick={() => setEditingItem("new")}>
              <PlusIcon />
              Agregar formación
            </Button>
          </div>
        )}

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
                      {DEGREE_LEVEL_LABELS[item.degreeLevel]}
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
                      onClick={() => setDeletingItem(item)}
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

        <Dialog open={deletingItem !== null} onOpenChange={(open) => !open && setDeletingItem(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader className="pr-8">
              <DialogTitle className="text-lg">¿Eliminar esta formación?</DialogTitle>
              <DialogDescription>
                {deletingItem && (
                  <>
                    <strong>{degreeName(degrees, deletingItem.degreeId)}</strong> se borra de tu
                    perfil. Esta acción es <strong>irreversible</strong>.
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" type="button" className="w-full sm:w-auto">
                  Cancelar
                </Button>
              </DialogClose>
              <Button
                variant="destructive"
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="w-full sm:w-auto"
              >
                {isDeleting ? "Eliminando..." : "Sí, eliminar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  },
);

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
  const startDate = useWatch({ control: form.control, name: "startDate" });
  const description = useWatch({ control: form.control, name: "description" }) ?? "";
  const degrees = useDegrees();

  // Institución obligatoria cuando la carrera elegida NO es de la UCU
  // (docs/ENDPOINTS.md, sección 4) — el backend la valida igual, esto solo
  // adelanta el error en el form.
  const selectedDegree = degrees.find((d) => d.degreeId === degreeId);
  const institutionRequired = Boolean(selectedDegree && !selectedDegree.isUcu);

  return (
    <Dialog open={item !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {/* min-w-0 — mismo motivo que en `work-experience-tab.tsx`: este form es
            el grid item del DialogContent y sin esto el min-content del Textarea
            (`field-sizing-content`) con una cadena larga sin espacios lo estira y
            el campo se sale del modal hacia la derecha. */}
        <form
          className="min-w-0"
          onSubmit={form.handleSubmit(async (values) => {
            form.clearErrors("root");
            try {
              await onSubmit(values);
            } catch (err) {
              // Bad request del backend (ej. institución faltante, fechas
              // inválidas) no se mostraba en ningún lado — quedaba como una
              // promesa rechazada sin manejar (encontrado en QA manual).
              if (err instanceof ApiError && err.fieldErrors) {
                const { unmapped } = applyFieldErrors(
                  err.fieldErrors,
                  form.setError,
                  EDUCATION_KNOWN_FIELDS,
                );
                if (unmapped.length) {
                  form.setError("root", { type: "server", message: unmapped.join(" · ") });
                }
              } else {
                form.setError("root", {
                  type: "server",
                  message:
                    err instanceof Error ? err.message : "No se pudo guardar. Intentá nuevamente.",
                });
              }
            }
          })}
          noValidate
        >
          <DialogHeader>
            <DialogTitle>{item === "new" ? "Agregar formación" : "Editar formación"}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            {form.formState.errors.root?.message && (
              <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">
                {form.formState.errors.root.message}
              </p>
            )}

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
              <p className="text-sm text-muted-foreground">
                Elegí &quot;Licenciatura&quot; si tu título se llama así (ej. Enfermería).
                &quot;Grado&quot; es para el resto de las carreras de grado, como Ingeniería.
              </p>
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
                      {Object.entries(DEGREE_LEVEL_LABELS).map(([value, label]) => (
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
                  max={todayIso()}
                  aria-invalid={Boolean(form.formState.errors.startDate)}
                  {...form.register("startDate", { required: true })}
                />
                <FieldError errors={[form.formState.errors.startDate]} />
              </Field>
              <Field>
                <FieldLabel htmlFor="ed-end">Hasta</FieldLabel>
                <Input
                  id="ed-end"
                  type="date"
                  min={startDate || undefined}
                  max={todayIso()}
                  disabled={isCurrent}
                  {...form.register("endDate")}
                />
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

            <Field data-invalid={Boolean(form.formState.errors.description)}>
              <FieldLabel htmlFor="ed-description">Descripción</FieldLabel>
              <Textarea
                id="ed-description"
                className="min-h-20 max-h-40 overflow-y-auto"
                maxLength={PROFILE_ITEM_DESCRIPTION_MAX}
                {...form.register("description")}
              />
              <p className="text-right text-xs text-muted-foreground">
                {description.length}/{PROFILE_ITEM_DESCRIPTION_MAX}
              </p>
              <FieldError errors={[form.formState.errors.description]} />
            </Field>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={form.formState.isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
