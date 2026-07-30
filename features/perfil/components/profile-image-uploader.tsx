"use client";

// Avatar propio + acciones para cambiarlo y quitarlo. Lo montan las dos
// pantallas de perfil (alumno y empresa): la foto vive en `User`, así que el
// componente es el mismo para los dos roles y solo cambian las iniciales del
// fallback. ADMIN no lo monta: no tiene pantalla de perfil y no lleva foto
// (decisión del equipo 2026-07-30, ver también `navbar.tsx`).
//
// Un solo botón, no dos: mientras hay foto es "Editar imagen", un menú con
// "Cambiar imagen" y "Quitar imagen". Sin foto no hay nada que editar, así que
// ahí el botón es directamente "Subir imagen" y abre el explorador de archivos
// de una, sin menú intermedio.

import { useRef, useState } from "react";
import { ChevronDownIcon } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useProfileImage } from "@/hooks/use-profile-image";
import {
  PROFILE_IMAGE_ACCEPTED_TYPES,
  useDeleteProfileImage,
  useUpdateProfileImage,
  validateProfileImage,
} from "@/features/perfil/hooks/use-profile-image";

export function ProfileImageUploader({
  userId,
  fallback,
  className,
}: {
  userId: string;
  /** Iniciales para cuando no hay foto (o mientras falla la firma de la URL). */
  fallback: string;
  className?: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { imageUrl, isLoading, isUnavailable, hasImage, isIndeterminate } =
    useProfileImage(userId);
  const { updateImage, isLoading: isUploading } = useUpdateProfileImage(userId);
  const { deleteImage, isLoading: isDeleting } = useDeleteProfileImage(userId);

  const isBusy = isUploading || isDeleting;
  // Se ofrece quitar cuando sabemos que hay imagen —aunque no hayamos podido
  // firmar su URL, en cuyo caso el archivo igual está guardado— y también
  // cuando no pudimos averiguarlo (`GET /user/{id}` falló): esconder la acción
  // ahí dejaría sin forma de borrar a alguien que sí tiene una foto subida. Si
  // resulta que no había ninguna, el backend responde 404 y se ve el error.
  const canRemove = hasImage || isUnavailable || isIndeterminate;

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Reset inmediato: sin esto, elegir el mismo archivo dos veces seguidas no
    // vuelve a disparar el evento.
    event.target.value = "";
    if (!file) return;

    const validationError = validateProfileImage(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      await updateImage(file);
      toast.success("Imagen de perfil actualizada.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo actualizar la imagen.");
    }
  }

  async function handleDelete() {
    try {
      await deleteImage();
      setConfirmOpen(false);
      toast.success("Imagen de perfil eliminada.");
    } catch (error) {
      // El diálogo queda abierto a propósito: el error se ve en el toast y
      // desde ahí se puede reintentar o cancelar.
      toast.error(error instanceof Error ? error.message : "No se pudo quitar la imagen.");
    }
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-4">
        {/* Mientras se resuelve la URL firmada —y mientras se sube una nueva,
            que invalida la anterior— va Skeleton en vez de la imagen vieja: no
            hay preview local, así que este es el único estado intermedio. */}
        {isLoading || isUploading ? (
          <Skeleton className="size-16 rounded-full" />
        ) : (
          <Avatar size="lg" className="size-16">
            {imageUrl && <AvatarImage src={imageUrl} alt="Imagen de perfil" />}
            <AvatarFallback className="text-lg font-medium">{fallback}</AvatarFallback>
          </Avatar>
        )}

        <div className="flex flex-col items-start gap-1">
          {/* Mientras `isLoading` va un Skeleton y no un botón: hasta que no
              resuelve no sabemos si corresponde "Subir imagen" o "Editar
              imagen", y renderizar uno para cambiarlo por el otro un instante
              después es un parpadeo (además de un blanco donde después aparece
              la opción de quitar). */}
          {isLoading ? (
            <Skeleton className="h-8 w-32 rounded-lg" />
          ) : isBusy ? (
            <Button type="button" variant="outline" size="sm" disabled>
              {isUploading ? "Subiendo..." : "Quitando..."}
            </Button>
          ) : canRemove ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline" size="sm">
                  Editar imagen
                  <ChevronDownIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onSelect={openFilePicker}>Cambiar imagen</DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onSelect={() => setConfirmOpen(true)}>
                  Quitar imagen
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button type="button" variant="outline" size="sm" onClick={openFilePicker}>
              Subir imagen
            </Button>
          )}

          {/* Hay imagen subida pero el backend no puede darnos una URL para
              mostrarla (`503`: el storage del entorno no está configurado para
              firmar — ver el aviso en `hooks/use-profile-image.ts`). Sin este
              texto el avatar cae a las iniciales y parece que la subida falló,
              cuando en realidad el archivo está guardado. */}
          {isUnavailable ? (
            <p className="text-xs text-muted-foreground">
              Tu imagen está guardada, pero no se puede mostrar en este momento.
            </p>
          ) : isIndeterminate ? (
            <p className="text-xs text-muted-foreground">
              No pudimos verificar tu imagen de perfil. Podés subir una nueva igual.
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">JPG o PNG, hasta 5 MB.</p>
          )}
        </div>
      </div>

      {/* El input real queda oculto: el disparador visible es el Button (o el
          ítem del menú) de arriba, para no pelear con el estilo nativo de
          `input[type=file]`. Vive fuera del DropdownMenu a propósito — si
          estuviera adentro, cerrar el menú lo desmontaría y cancelaría el
          explorador de archivos que acaba de abrir. */}
      <input
        ref={fileInputRef}
        type="file"
        accept={PROFILE_IMAGE_ACCEPTED_TYPES.join(",")}
        className="hidden"
        onChange={handleFileChange}
      />

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="pr-8">
            <DialogTitle className="text-lg">¿Quitar la imagen de perfil?</DialogTitle>
            <DialogDescription>
              Tu perfil vuelve a mostrarse con tus iniciales. Podés volver a subir una
              cuando quieras.
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
              {isDeleting ? "Quitando..." : "Sí, quitar imagen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
