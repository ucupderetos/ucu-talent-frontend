"use client";

// Adapta las acciones de una cuenta pendiente a los menús compartidos por los
// listados generales. Así, todas las columnas "Acciones" usan el mismo menú
// compacto y las mismas confirmaciones para aprobar o rechazar.

import { CompanyModerationActions } from "@/features/moderacion/components/companies/company-moderation-actions";
import { StudentModerationActions } from "@/features/moderacion/components/students/student-moderation-actions";
import type { ReviewAccountInput } from "@/features/moderacion/hooks/use-review-account";

interface ReviewActionsProps {
  userId: string;
  displayName: string;
  accountType: ReviewAccountInput["accountType"];
}

export function ReviewActions({ userId, displayName, accountType }: ReviewActionsProps) {
  if (accountType === "company") {
    return (
      <CompanyModerationActions
        company={{ id: userId, name: displayName, status: "PENDIENTE" }}
        presentation="menu"
      />
    );
  }

  return (
    <StudentModerationActions
      userId={userId}
      status="PENDIENTE"
      displayName={displayName}
      presentation="menu"
    />
  );
}
