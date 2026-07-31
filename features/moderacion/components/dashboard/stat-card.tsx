"use client";

// Una métrica de la fila superior del dashboard. Usa `Card` como el resto de
// los bloques de la pantalla, en vez de armar la caja a mano.

import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

const NUMBER_FORMAT = new Intl.NumberFormat("es-UY");

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: number;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <Card>
      <CardContent>
        <div className="flex items-start gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted">
            <Icon className="size-5 text-muted-foreground" aria-hidden />
          </div>

          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="mt-1 truncate text-3xl font-semibold tracking-tight">
              {NUMBER_FORMAT.format(value)}
            </p>
          </div>
        </div>

        <p className="mt-5 text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
