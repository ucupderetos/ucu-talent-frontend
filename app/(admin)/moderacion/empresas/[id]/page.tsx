import { CompanyDetailView } from "@/features/moderacion/components/companies/company-detail-view";

type AdminCompanyDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminCompanyDetailPage({
  params,
}: AdminCompanyDetailPageProps) {
  const { id } = await params;

  return <CompanyDetailView companyId={id} />;
}
