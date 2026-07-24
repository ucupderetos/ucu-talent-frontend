"use client";

// Pestaña "Habilidades" de Mi perfil: `StudentProfile.skills` (string[]) como
// chips agregables/removibles. No hay componente de tags en components/ui/
// todavía — se arma acá mismo, es la primera pantalla que lo necesita.

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
import { Input } from "@/components/ui/input";
import { useUpdateSkills } from "@/features/perfil/hooks/use-update-student-profile";

export function SkillsTab({ skills }: { skills: string[] }) {
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [savedSkills, setSavedSkills] = useState(skills);
  const [draftSkills, setDraftSkills] = useState(skills);
  const [inputValue, setInputValue] = useState("");
  const { updateSkills, isLoading, error } = useUpdateSkills();

  function startEditing() {
    setDraftSkills(savedSkills);
    setInputValue("");
    setMode("edit");
  }

  function addSkill() {
    const value = inputValue.trim();
    if (!value || draftSkills.includes(value)) {
      setInputValue("");
      return;
    }
    setDraftSkills((current) => [...current, value]);
    setInputValue("");
  }

  function removeSkill(skill: string) {
    setDraftSkills((current) => current.filter((s) => s !== skill));
  }

  async function save() {
    await updateSkills(draftSkills);
    setSavedSkills(draftSkills);
    setMode("view");
    toast.success("Habilidades actualizadas.");
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
          {savedSkills.length === 0 ? (
            <p className="text-sm italic text-muted-foreground">
              Todavía no agregaste habilidades.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {savedSkills.map((skill) => (
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

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex gap-2">
          <Button type="button" disabled={isLoading} onClick={save} className="w-fit">
            {isLoading ? "Guardando..." : "Guardar cambios"}
          </Button>
          <Button type="button" variant="outline" onClick={() => setMode("view")} className="w-fit">
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
