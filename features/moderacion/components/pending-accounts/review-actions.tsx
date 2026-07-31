"use client";

// Adapta las acciones de una cuenta pendiente a los componentes compartidos por
// los listados generales. Así, todas las columnas "Acciones" usan los mismos
// iconos con tooltip y las mismas confirmaciones para aprobar o rechazar.

import { CompanyModerationActions } from "@/features/moderacion/components/companies/company-moderation-actions";
import { StudentModerationActions } from "@/features/moderacion/components/students/student-moderation-actions";
import type { ReviewAccountInput } from "@/features/moderacion/hooks/use-review-account";

interface ReviewActionsProps {
  userId: string;
  displayName: string;
  accountType: ReviewAccountInput["accountType"];
}

export function ReviewActions({ userId, displayName, accountType }: ReviewActionsProps) {
  if (accountType === "EMPRESA") {
    return (
      <CompanyModerationActions
        company={{ id: userId, name: displayName, status: "PENDIENTE" }}
        includeDetailLink
      />
    );
  }

  return (
    <StudentModerationActions
      userId={userId}
      status="PENDIENTE"
      displayName={displayName}
      includeDetailLink
    />
  );
}
