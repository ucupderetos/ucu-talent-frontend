"use client";

import { PageHeader } from "@/components/layout/page-header";
import { CompanyProfileForm } from "@/features/perfil/components/company-profile-form";
import { CompanyProfilePreview } from "@/features/perfil/components/company-profile-preview";
import { CompanyProfileTips } from "@/features/perfil/components/company-profile-tips";
import { useCompanyProfileForm } from "@/features/perfil/hooks/use-company-profile-form";

export default function PerfilEmpresaPage() {
  const { form, mode, startEditing, commitSave, cancelEditing } = useCompanyProfileForm();

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