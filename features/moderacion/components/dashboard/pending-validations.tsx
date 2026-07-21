import Link from "next/link";
import { Building2 } from "lucide-react";

import type { PendingCompanyValidation } from "../../types";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type PendingValidationsProps = {
  validations: PendingCompanyValidation[];
};

export function PendingValidations({
  validations,
}: PendingValidationsProps) {
  const visibleValidations = validations.slice(0, 3);

  return (
    <Card className="flex h-full flex-col overflow-hidden py-0">
      <CardHeader className="px-5 py-2">
        <CardTitle className="text-base font-semibold text-slate-950">
          Validaciones pendientes
        </CardTitle>
      </CardHeader>

      <Separator />

      <CardContent className="flex-1 p-0">
        {visibleValidations.map((validation, index) => (
          <div key={validation.id}>
            <div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <Avatar className="size-10 rounded-lg">
                  <AvatarFallback className="rounded-lg bg-blue-50 text-blue-600">
                    <Building2
                      className="size-5"
                      aria-hidden="true"
                    />
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-950">
                    {validation.name}
                  </p>

                  <p className="truncate text-sm text-slate-500">
                    {validation.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <div className="text-sm text-slate-500">
                  <p>Registrada el</p>

                  <p className="font-medium text-slate-700">
                    {validation.registeredAt}
                  </p>
                </div>

                <Button asChild variant="outline">
                  <Link href={`/empresas/${validation.id}`}>
                    Revisar
                  </Link>
                </Button>
              </div>
            </div>

            {index < visibleValidations.length - 1 && (
              <Separator />
            )}
          </div>
        ))}
      </CardContent>

      <Separator />

      <CardFooter className="mt-auto px-5 py-3">
        <Button
          asChild
          variant="link"
          className="h-auto p-0 text-blue-600"
        >
          <Link href="/validaciones">
            Ver todas las pendientes
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}