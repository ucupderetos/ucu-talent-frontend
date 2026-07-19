"use client";

import { PageHeader } from "@/components/layout/page-header";
import { CompanyProfileForm } from "@/features/perfil-empresa/components/CompanyProfileForm";
import { CompanyProfilePreview } from "@/features/perfil-empresa/components/CompanyProfilePreview";
import { CompanyProfileTips } from "@/features/perfil-empresa/components/CompanyProfileTips";
import { useCompanyProfileForm } from "@/features/perfil-empresa/hooks/use-company-profile-form";

export default function PerfilEmpresaPage() {
  const { form, mode, startEditing, stopEditing } = useCompanyProfileForm();
  return (
    <>
      <PageHeader
        title="Perfil de empresa"
        description="Gestioná la información pública de tu empresa. Esta información será visible para los estudiantes."
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <CompanyProfileForm form={form} />
        <div className="flex flex-col gap-6">
          <CompanyProfilePreview form={form} />
          <CompanyProfileTips />
        </div>
      </div>
    </>
  );
}