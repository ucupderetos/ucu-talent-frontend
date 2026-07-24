// Ruta: /postulantes — postulantes de todas las ofertas de la empresa.
// Delgada a propósito: toda la lógica vive en features/postulaciones/.
//
// `Suspense`: `ApplicantsView` usa `useSearchParams()` (para `?vacancyId=`),
// que en el App Router exige un límite de Suspense alrededor.

import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { ApplicantsView } from "@/features/postulaciones/components/applicants-view";

export default function PostulantesPage() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <ApplicantsView />
    </Suspense>
  );
}
