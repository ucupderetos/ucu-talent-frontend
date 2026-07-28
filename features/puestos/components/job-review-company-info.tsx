"use client";

// Bloque "Sobre la empresa" del Paso 3 (Revisión). useCurrentCompany() ya
// resuelve name y description reales — no depende de que el backend exponga
// más campos, así que dejó de ser mock.

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrentCompany } from "@/hooks/use-current-company";

export function JobReviewCompanyInfo() {
  const { company } = useCurrentCompany();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sobre la empresa</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex h-16 items-center justify-center rounded-md border px-4">
          <p className="text-sm font-bold tracking-tight">{company?.name}</p>
        </div>
        <p className="text-sm text-muted-foreground">{company?.description}</p>
      </CardContent>
    </Card>
  );
}