"use client";

// Vista de perfil de empresa: formulario editable + preview + tips.
// Se monta desde /perfil (route group compartido (perfil)) cuando el rol es
// EMPRESA — ver app/(perfil)/perfil/page.tsx.

import { PageHeader } from "@/components/layout/page-header";
import { CompanyProfileForm } from "@/features/perfil/components/company-profile-form";
import { CompanyProfilePreview } from "@/features/perfil/components/company-profile-preview";
import { CompanyProfileTips } from "@/features/perfil/components/company-profile-tips";
import { useCompanyProfileForm } from "@/features/perfil/hooks/use-company-profile-form";

export function CompanyProfileView() {
  const { form, mode, startEditing, commitSave, cancelEditing, isLoading } = useCompanyProfileForm();
  return (
    <>
      <PageHeader
        title="Perfil de empresa"
        description="Gestioná la información pública de tu empresa. Esta información será visible para los estudiantes."
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CompanyProfileForm
            form={form}
            mode={mode}
            startEditing={startEditing}
            commitSave={commitSave}
            cancelEditing={cancelEditing}
            isLoading={isLoading}
          />
        </div>
        <div className="flex flex-col gap-6">
          <CompanyProfilePreview form={form} />
          <CompanyProfileTips />
        </div>
      </div>
    </>
  );
}
