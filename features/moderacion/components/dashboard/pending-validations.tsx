"use client";

// Empresas esperando validación, en el dashboard. Muestra solo las 3 primeras;
// el resto se ve en la pantalla de Validaciones.

import Link from "next/link";
import { Building2Icon } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/layout/empty-state";
import { Separator } from "@/components/ui/separator";
import type { PendingCompanyValidation } from "@/features/moderacion/types";

const VISIBLE_COUNT = 3;

function formatDate(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!match) return "—";

  const [, year, month, day] = match;
  return new Date(Number(year), Number(month) - 1, Number(day)).toLocaleDateString("es-UY");
}

export function PendingValidations({
  validations,
}: {
  validations: PendingCompanyValidation[];
}) {
  const visible = validations.slice(0, VISIBLE_COUNT);

  return (
    <Card className="flex flex-col gap-0 overflow-hidden py-0">
      <CardHeader className="px-5 py-3">
        <CardTitle>Validaciones pendientes</CardTitle>
      </CardHeader>

      <Separator />

      <CardContent className="flex-1 p-0">
        {visible.length === 0 ? (
          <div className="p-5">
            <EmptyState
              title="No hay validaciones pendientes"
              description="Las empresas que se registren van a aparecer acá."
            />
          </div>
        ) : (
          visible.map((validation, index) => (
            <div key={validation.companyId}>
              <div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <Avatar className="size-10 rounded-lg">
                    <AvatarFallback className="rounded-lg bg-chart-1/15 text-chart-1">
                      <Building2Icon className="size-5" aria-hidden />
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{validation.name}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {validation.industry}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <div className="text-sm text-muted-foreground">
                    <p>Registrada el</p>
                    <p className="font-medium text-foreground">
                      {formatDate(validation.registeredAt)}
                    </p>
                  </div>

                  <Button asChild variant="outline">
                    <Link href={`/moderacion/empresas/${validation.companyId}`}>Detalles</Link>
                  </Button>
                </div>
              </div>

              {index < visible.length - 1 && <Separator />}
            </div>
          ))
        )}
      </CardContent>

      <CardFooter className="mt-auto px-5 py-3">
        <Button asChild variant="link" className="h-auto p-0 text-primary">
          <Link href="/moderacion/validaciones">Ver todas las validaciones pendientes</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
