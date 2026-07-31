"use client";

// Pestaña "Habilidades" de Mi perfil: `StudentProfile.skills` (string[]) como
// chips agregables/removibles. No hay componente de tags en components/ui/
// todavía — se arma acá mismo, es la primera pantalla que lo necesita.
//
// `PUT /student-profile/{id}` reemplaza el objeto entero (ver
// use-update-student-profile.ts): el submit manda `phoneNumber`/
// `linkedinUrl`/`description` del borrador compartido (`draft`, dueño en
// `student-profile-view.tsx`) sin tocar, junto con los skills editados acá.
// Es el mismo borrador que usa "Información personal" — necesario porque el
// backend exige los cuatro campos no vacíos en cada request, y las dos
// pestañas los reparten (ver el comentario en `StudentProfileDraft`,
// features/perfil/types.ts).
//
// ⚠️ `addSkill`/`removeSkill` empujan a `onDraftChange` EN VIVO, no recién al
// guardar — mismo motivo que los campos de "Información personal": si
// "Habilidades" solo actualizara el borrador al guardar, una cuenta recién
// creada (los cuatro campos vacíos) nunca podría guardar "Información
// personal" primero (necesitaría `skills` ya en el borrador antes de que
// esta pestaña se haya guardado ni una vez).
//
// ⚠️ Si el guardado falla (ej. el backend rechaza un array de skills vacío
// con "El skills es obligatorio" — no se puede sacar la última skill), hay
// que REVERTIR el borrador compartido a lo que tenía antes de este intento de
// edición. Sin este rollback, el empuje en vivo de arriba deja el borrador
// (y por lo tanto la vista) mostrando el estado fallido — "sin habilidades"
// aunque el servidor todavía tenga la skill guardada (encontrado en QA
// manual). `skillsBeforeEdit` guarda ese punto de partida.

import { useState } from "react";
import { XIcon } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useUpdateStudentProfile } from "@/features/perfil/hooks/use-update-student-profile";
import type { StudentProfileDraft } from "@/features/perfil/types";

export function SkillsTab({
  studentProfileId,
  draft,
  onDraftChange,
}: {
  studentProfileId: string;
  draft: StudentProfileDraft;
  onDraftChange: (patch: Partial<StudentProfileDraft>) => void;
}) {
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [draftSkills, setDraftSkills] = useState(draft.skills);
  const [skillsBeforeEdit, setSkillsBeforeEdit] = useState(draft.skills);
  const [inputValue, setInputValue] = useState("");
  const { updateProfile, isLoading, error } = useUpdateStudentProfile(studentProfileId);

  function startEditing() {
    setDraftSkills(draft.skills);
    setSkillsBeforeEdit(draft.skills);
    setInputValue("");
    setMode("edit");
  }

  function cancelEditing() {
    // Revierte el borrador compartido al punto de partida de esta edición —
    // como `addSkill`/`removeSkill` empujan en vivo a `onDraftChange`,
    // cancelar sin esto dejaría los cambios descartados pegados en la vista y
    // guardables desde "Información personal" (mismo rollback que el `catch`
    // de `save`).
    setDraftSkills(skillsBeforeEdit);
    onDraftChange({ skills: skillsBeforeEdit });
    setMode("view");
  }

  function addSkill() {
    const value = inputValue.trim();
    if (!value || draftSkills.includes(value)) {
      setInputValue("");
      return;
    }
    const next = [...draftSkills, value];
    setDraftSkills(next);
    onDraftChange({ skills: next });
    setInputValue("");
  }

  function removeSkill(skill: string) {
    const next = draftSkills.filter((s) => s !== skill);
    setDraftSkills(next);
    onDraftChange({ skills: next });
  }

  async function save() {
    try {
      // `phoneNumber`/`linkedinUrl`/`description` salen del borrador
      // compartido: pueden haber sido editados desde "Información personal"
      // sin que esa pestaña se haya guardado todavía.
      await updateProfile({
        phoneNumber: draft.phoneNumber,
        linkedinUrl: draft.linkedinUrl,
        description: draft.description,
        skills: draftSkills,
      });
      onDraftChange({ skills: draftSkills });
      setMode("view");
      toast.success("Habilidades actualizadas.");
    } catch {
      // Revierte el borrador compartido al punto de partida de esta edición
      // — sin esto, el empuje en vivo de addSkill/removeSkill deja la vista
      // mostrando el intento fallido en vez del último estado real guardado.
      setDraftSkills(skillsBeforeEdit);
      onDraftChange({ skills: skillsBeforeEdit });
    }
  }

  if (mode === "view") {
    return (
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>Habilidades</CardTitle>
            <CardDescription>Las skills que las empresas ven en tu perfil.</CardDescription>
          </div>
          <Button type="button" variant="outline" onClick={startEditing}>
            Editar
          </Button>
        </CardHeader>
        <CardContent>
          {draft.skills.length === 0 ? (
            <p className="text-sm italic text-muted-foreground">
              Todavía no agregaste habilidades.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {draft.skills.map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="bg-secondary-blue text-secondary-blue-foreground"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Habilidades</CardTitle>
        <CardDescription>Las skills que las empresas ven en tu perfil.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSkill();
              }
            }}
            placeholder="Ej: React"
            aria-label="Agregar habilidad"
          />
          <Button type="button" variant="outline" onClick={addSkill} className="shrink-0">
            Agregar
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {draftSkills.map((skill) => (
            <Badge
              key={skill}
              variant="secondary"
              className="gap-1 bg-secondary-blue pr-1 text-secondary-blue-foreground"
            >
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                aria-label={`Quitar ${skill}`}
                className="rounded-full p-0.5 hover:bg-foreground/10"
              >
                <XIcon className="size-3" />
              </button>
            </Badge>
          ))}
        </div>

        {error && <FieldError>{error}</FieldError>}

        <div className="flex gap-2">
          <Button type="button" disabled={isLoading} onClick={save} className="w-fit">
            {isLoading ? "Guardando..." : "Guardar cambios"}
          </Button>
          <Button type="button" variant="outline" onClick={cancelEditing} className="w-fit">
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
