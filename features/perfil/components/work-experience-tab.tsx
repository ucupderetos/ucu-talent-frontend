"use client";

// Pestaña "Experiencia laboral" de Mi perfil: lista de `WorkExperience` +
// alta/edición en un Dialog (todos los campos son opcionales en el wire, ver
// WorkExperienceInput en features/perfil/types.ts). El borrado pega contra
// `DELETE /work-experience/{id}` real (use-work-experience.ts) y por eso pasa
// por un diálogo de confirmación, igual que "Formación académica".

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
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateWorkExperience,
  useDeleteWorkExperience,
  useUpdateWorkExperience,
} from "@/features/perfil/hooks/use-work-experience";
import { PROFILE_ITEM_DESCRIPTION_MAX } from "@/features/perfil/types";
import type { WorkExperienceInput } from "@/features/perfil/types";
import { ApiError } from "@/lib/api-client";
import { applyFieldErrors } from "@/lib/form-errors";
import type { WorkExperience } from "@/types";

const WORK_EXPERIENCE_KNOWN_FIELDS = new Set([
  "company",
  "position",
  "startDate",
  "endDate",
  "description",
]);

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

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
    // Ver el mismo comentario en education-tab.tsx: resincroniza la copia
    // local durante el render (no un useEffect) si `workExperience` cambia
    // por fuera de las mutaciones de acá (refetch de fondo tras invalidación,
    // otra pestaña re-sembrando el perfil), para que no quede desalineada del
    // server state real.
    const [prevWorkExperience, setPrevWorkExperience] = useState(workExperience);
    if (workExperience !== prevWorkExperience) {
      setPrevWorkExperience(workExperience);
      setItems(workExperience);
    }

    const [editingItem, setEditingItem] = useState<WorkExperience | "new" | null>(null);
    const [deletingItem, setDeletingItem] = useState<WorkExperience | null>(null);

    const { createWorkExperience } = useCreateWorkExperience();
    const { updateWorkExperience } = useUpdateWorkExperience();
    const { deleteWorkExperience, isLoading: isDeleting } = useDeleteWorkExperience();

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

    async function confirmDelete() {
      if (!deletingItem) return;
      await deleteWorkExperience({
        workExperienceId: deletingItem.workExperienceId,
        studentProfileId,
      });
      setItems((current) =>
        current.filter((i) => i.workExperienceId !== deletingItem.workExperienceId),
      );
      toast.success("Experiencia laboral eliminada.");
      setDeletingItem(null);
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

        <WorkExperienceDialog
          item={editingItem}
          onOpenChange={(open) => !open && setEditingItem(null)}
          onSubmit={handleSubmit}
        />

        <Dialog open={deletingItem !== null} onOpenChange={(open) => !open && setDeletingItem(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader className="pr-8">
              <DialogTitle className="text-lg">¿Eliminar esta experiencia?</DialogTitle>
              <DialogDescription>
                {deletingItem && (
                  <>
                    <strong>{deletingItem.position || "Esta experiencia"}</strong> se borra de tu
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
  const startDate = useWatch({ control: form.control, name: "startDate" });
  const description = useWatch({ control: form.control, name: "description" }) ?? "";

  return (
    <Dialog open={item !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {/* min-w-0: este form es el grid item del DialogContent, y su
            `min-width: auto` le impide achicarse por debajo del min-content de
            su contenido. El Textarea de "Descripción" usa `field-sizing-content`
            (default de components/ui/textarea), así que con una cadena larga sin
            espacios ese min-content se dispara y el textarea se estira a ~2900px,
            saliéndose del modal hacia la derecha. Con `min-w-0` el item sí se
            achica y el textarea vuelve a respetar su `w-full`, conservando el
            auto-crecimiento vertical hasta su `max-h-40`.
            ⚠️ Va acá y no en el div de adentro: ese div es hijo de un bloque, no
            item de flex/grid, así que `min-width: auto` ni le aplica. */}
        <form
          className="min-w-0"
          onSubmit={form.handleSubmit(async (values) => {
            form.clearErrors("root");
            try {
              await onSubmit(values);
            } catch (err) {
              // Mismo gap que en "Formación académica": un bad request del
              // backend no se mostraba en ningún lado (encontrado en QA manual).
              if (err instanceof ApiError && err.fieldErrors) {
                const { unmapped } = applyFieldErrors(
                  err.fieldErrors,
                  form.setError,
                  WORK_EXPERIENCE_KNOWN_FIELDS,
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
            <DialogTitle>{item === "new" ? "Agregar experiencia" : "Editar experiencia"}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            {form.formState.errors.root?.message && (
              <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">
                {form.formState.errors.root.message}
              </p>
            )}

            <Field data-invalid={Boolean(form.formState.errors.position)}>
              <FieldLabel htmlFor="we-position">Cargo</FieldLabel>
              <Input id="we-position" {...form.register("position")} />
              <FieldError errors={[form.formState.errors.position]} />
            </Field>

            <Field data-invalid={Boolean(form.formState.errors.company)}>
              <FieldLabel htmlFor="we-company">Empresa</FieldLabel>
              <Input id="we-company" {...form.register("company")} />
              <FieldError errors={[form.formState.errors.company]} />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field data-invalid={Boolean(form.formState.errors.startDate)}>
                <FieldLabel htmlFor="we-start">Desde</FieldLabel>
                <Input id="we-start" type="date" max={todayIso()} {...form.register("startDate")} />
                <FieldError errors={[form.formState.errors.startDate]} />
              </Field>
              <Field data-invalid={Boolean(form.formState.errors.endDate)}>
                <FieldLabel htmlFor="we-end">Hasta</FieldLabel>
                <Input
                  id="we-end"
                  type="date"
                  min={startDate || undefined}
                  max={todayIso()}
                  disabled={isCurrent}
                  {...form.register("endDate")}
                />
                <FieldError errors={[form.formState.errors.endDate]} />
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

            <Field data-invalid={Boolean(form.formState.errors.description)}>
              <FieldLabel htmlFor="we-description">Descripción</FieldLabel>
              <Textarea
                id="we-description"
                className="min-h-24 max-h-40 overflow-y-auto"
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
