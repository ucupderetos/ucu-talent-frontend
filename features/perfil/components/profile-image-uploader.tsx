"use client";

// Avatar propio + acciones para cambiarlo y quitarlo. Lo montan las dos
// pantallas de perfil (alumno y empresa): la foto vive en `User`, así que el
// componente es el mismo para los dos roles y solo cambian las iniciales del
// fallback.
//
// No hay diálogo de confirmación para "Quitar" a propósito: se deshace
// volviendo a subir una, así que no está al nivel de "cerrar una vacante"
// (`vacancy-table.tsx`), que sí es terminal.

import { useRef } from "react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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

  const { imageUrl, isLoading, isUnavailable } = useProfileImage(userId);
  const { updateImage, isLoading: isUploading } = useUpdateProfileImage(userId);
  const { deleteImage, isLoading: isDeleting } = useDeleteProfileImage(userId);

  const isBusy = isUploading || isDeleting;
  // Con `isUnavailable` hay una imagen subida aunque no tengamos su URL: las
  // acciones son las de "ya tiene imagen" (cambiarla, quitarla), no las de
  // "todavía no subió ninguna".
  const hasImage = Boolean(imageUrl) || isUnavailable;

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
      toast.success("Imagen de perfil eliminada.");
    } catch (error) {
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
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isBusy}
              onClick={() => fileInputRef.current?.click()}
            >
              {isUploading ? "Subiendo..." : hasImage ? "Cambiar imagen" : "Subir imagen"}
            </Button>
            {hasImage && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isBusy}
                onClick={handleDelete}
              >
                {isDeleting ? "Quitando..." : "Quitar"}
              </Button>
            )}
          </div>
          {/* Hay imagen subida pero el backend no puede darnos una URL para
              mostrarla (`503`: el storage del entorno no está configurado para
              firmar — ver el aviso en `hooks/use-profile-image.ts`). Sin este
              texto el avatar cae a las iniciales y parece que la subida falló,
              cuando en realidad el archivo está guardado. */}
          {isUnavailable ? (
            <p className="text-xs text-muted-foreground">
              Tu imagen está guardada, pero no se puede mostrar en este momento.
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">JPG o PNG, hasta 5 MB.</p>
          )}
        </div>
      </div>

      {/* El input real queda oculto: el disparador visible es el Button de
          arriba, para no pelear con el estilo nativo de `input[type=file]`. */}
      <input
        ref={fileInputRef}
        type="file"
        accept={PROFILE_IMAGE_ACCEPTED_TYPES.join(",")}
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
