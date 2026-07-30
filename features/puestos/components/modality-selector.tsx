"use client";

import { HomeIcon, LaptopIcon, MapPinIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Modality } from "@/types";

const MODALITY_OPTIONS = [
  { value: "PRESENCIAL", label: "Presencial", helper: "En sitio", icon: MapPinIcon },
  { value: "HIBRIDO", label: "Híbrida", helper: "Combinada", icon: HomeIcon },
  { value: "REMOTO", label: "Remota", helper: "A distancia", icon: LaptopIcon },
] as const;

export function ModalitySelector({
  value,
  onChange,
  disabled = false,
}: {
  value: Modality | undefined;
  onChange: (value: Modality) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {MODALITY_OPTIONS.map((option) => {
        const isSelected = value === option.value;
        const Icon = option.icon;
        return (
          <button
            key={option.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex items-center gap-3 rounded-lg border p-4 text-left transition-colors",
              isSelected ? "border-primary bg-primary/5" : "border-input hover:bg-accent/50",
              disabled && "cursor-not-allowed opacity-50 hover:bg-transparent",
            )}
          >
            <Icon className="size-5 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <p className="text-sm font-medium">{option.label}</p>
              <p className="text-xs text-muted-foreground">{option.helper}</p>
            </div>
            <span
              className={cn(
                "ml-auto flex size-4 shrink-0 items-center justify-center rounded-full border-2",
                isSelected ? "border-primary" : "border-muted-foreground/30",
              )}
            >
              {isSelected && <span className="size-2 rounded-full bg-primary" />}
            </span>
          </button>
        );
      })}
    </div>
  );
}
