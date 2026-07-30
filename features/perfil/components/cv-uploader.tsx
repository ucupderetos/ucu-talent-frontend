"use client";

// Card "Currículum" de Mi perfil (alumno): subir, ver, cambiar y eliminar el CV.
// Solo el alumno dueño lo monta — el CV vive en `StudentProfile`, no en `User`,
// así que (a diferencia de la foto de perfil) no aplica a empresa ni a admin.
//
// Mismo criterio de UI que `profile-image-uploader.tsx`: un solo botón de
// acción. Sin CV es "Subir CV" y abre el explorador de archivos de una; con CV
// es un menú "Editar CV" con "Cambiar CV" y "Eliminar CV". Abrir el CV NO es un
// botón aparte: el link es el nombre del archivo (ver `cvDisplayName`), que es
// el gesto que uno espera de un adjunto.
//
// ⚠️ **El nombre original del archivo NO se guarda en ningún lado.** El backend
// lo descarta al subir: `StorageServiceImpl.buildObjectName` arma la key como
// `{carpeta}/{UUID}/{extensión}` — o sea `student-profiles/cv/{uuid}.pdf`, sin
// rastro de cómo se llamaba el archivo que eligió el alumno. Así que el nombre
// que muestra la card es un rótulo derivado de la extensión, no el título real;
// mostrar el verdadero necesita que el backend persista `originalFilename`.

import { useRef, useState } from "react";
import { ChevronDownIcon, ExternalLinkIcon, FileTextIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCvUrl } from "@/hooks/use-cv";
import {
  CV_ACCEPTED_TYPES,
  useDeleteCv,
  useUpdateCv,
  validateCv,
} from "@/features/perfil/hooks/use-cv";

/**
 * Rótulo del archivo adjunto. El nombre real no existe del lado del servidor
 * (ver el aviso de arriba), así que se arma con lo único que sobrevive en la
 * key: la extensión. Hoy eso siempre da "CV.pdf" —el backend solo acepta PDF—,
 * pero se lee de la key igual, por si eso se amplía.
 */
function cvDisplayName(cvFile: string | null): string {
  const extension = cvFile?.includes(".") ? cvFile.slice(cvFile.lastIndexOf(".")) : "";
  return `CV${extension}`;
}

export function CvUploader({
  studentProfileId,
  cvFile,
}: {
  studentProfileId: string;
  /** Key del CV en el storage, tal como llega en `StudentProfile.cvFile`.
   *  null si todavía no subió ninguno. */
  cvFile: string | null;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { cvUrl, isUnavailable } = useCvUrl(cvFile);
  const { updateCv, isLoading: isUploading } = useUpdateCv(studentProfileId);
  const { deleteCv, isLoading: isDeleting } = useDeleteCv(studentProfileId);

  const hasCv = Boolean(cvFile);
  const isBusy = isUploading || isDeleting;

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Reset inmediato: sin esto, elegir el mismo archivo dos veces seguidas no
    // vuelve a disparar el evento.
    event.target.value = "";
    if (!file) return;

    const validationError = validateCv(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      await updateCv(file);
      toast.success(hasCv ? "CV actualizado." : "CV subido.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo subir el CV.");
    }
  }

  async function handleDelete() {
    try {
      await deleteCv();
      setConfirmOpen(false);
      toast.success("CV eliminado.");
    } catch (error) {
      // El diálogo queda abierto a propósito: el error se ve en el toast y
      // desde ahí se puede reintentar o cancelar.
      toast.error(error instanceof Error ? error.message : "No se pudo eliminar el CV.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Currículum</CardTitle>
        <CardDescription>
          Sumá tu CV al perfil para que las empresas conozcan tu experiencia completa.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div
            className={
              hasCv
                ? "flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary-blue text-secondary-blue-foreground"
                : "flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"
            }
          >
            <FileTextIcon className="size-5" />
          </div>

          <div className="min-w-0">
            {/* El nombre es el link para abrir el CV: es el gesto que uno
                espera de un archivo adjunto, y evita tener dos controles
                distintos ("Ver CV" + el nombre) para la misma acción. Mientras
                la URL no esté resuelta el mismo texto queda sin link, sin
                cambiar de tamaño ni de lugar. */}
            {!hasCv ? (
              <p className="text-sm font-medium">Todavía no subiste tu CV</p>
            ) : cvUrl ? (
              <a
                href={cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                <span className="truncate">{cvDisplayName(cvFile)}</span>
                <ExternalLinkIcon className="size-3.5 shrink-0" aria-hidden />
              </a>
            ) : (
              <p className="truncate text-sm font-medium">{cvDisplayName(cvFile)}</p>
            )}
            {/* Hay un CV subido pero el backend no puede darnos una URL para
                abrirlo (`503`: el storage del entorno no está configurado para
                firmar — ver el aviso en `hooks/use-cv.ts`). Sin este texto la card
                queda sin acción de ver y parece que la subida falló, cuando en
                realidad el archivo está guardado. */}
            <p className="text-xs text-muted-foreground">
              {isUnavailable
                ? "Tu CV está guardado, pero no se puede abrir en este momento."
                : "PDF, hasta 5 MB."}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {isBusy ? (
            <Button type="button" variant="outline" size="sm" disabled>
              {isUploading ? "Subiendo..." : "Eliminando..."}
            </Button>
          ) : hasCv ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline" size="sm">
                  Editar CV
                  <ChevronDownIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={openFilePicker}>Cambiar CV</DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onSelect={() => setConfirmOpen(true)}>
                  Eliminar CV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button type="button" variant="outline" size="sm" onClick={openFilePicker}>
              Subir CV
            </Button>
          )}
        </div>
      </CardContent>

      {/* El input real queda oculto: el disparador visible es el Button (o el
          ítem del menú) de arriba, para no pelear con el estilo nativo de
          `input[type=file]`. Vive fuera del DropdownMenu a propósito — si
          estuviera adentro, cerrar el menú lo desmontaría y cancelaría el
          explorador de archivos que acaba de abrir. */}
      <input
        ref={fileInputRef}
        type="file"
        accept={CV_ACCEPTED_TYPES.join(",")}
        className="hidden"
        onChange={handleFileChange}
      />

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="pr-8">
            <DialogTitle className="text-lg">¿Eliminar tu CV?</DialogTitle>
            <DialogDescription>
              Las empresas dejan de verlo en tu perfil. Podés volver a subir uno cuando
              quieras.
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
              onClick={handleDelete}
              disabled={isDeleting}
              className="w-full sm:w-auto"
            >
              {isDeleting ? "Eliminando..." : "Sí, eliminar CV"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
