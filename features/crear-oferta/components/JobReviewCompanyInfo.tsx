// Bloque "Sobre la empresa" del Paso 3 (Revisión). Contenido mock por ahora:
// no hay conexión real con el perfil de la empresa logueada todavía.
//
// TODO: cuando exista la integración real, reemplazar por los datos de
// Company del usuario en sesión (GET /company?userId=, mismo patrón que
// features/perfil-empresa). Hoy son valores de ejemplo fijos.

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MOCK_COMPANY = {
  logoLabel: "H-MOVE",
  description:
    "Somos una compañía líder en bebidas y responsable de marcas como Amstel, Nativa, Heineken, Schneider, jugos Watt y muchos más.",
};

export function JobReviewCompanyInfo() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sobre la empresa</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex h-16 items-center justify-center rounded-md border px-4">
          <p className="text-sm font-bold tracking-tight">{MOCK_COMPANY.logoLabel}</p>
        </div>
        <p className="text-sm text-muted-foreground">{MOCK_COMPANY.description}</p>
        <a href="#" className="text-sm font-medium text-primary underline underline-offset-2">
          Ver más sobre la empresa
        </a>
      </CardContent>
    </Card>
  );
}