import { AdminVacancyDetailView } from "@/features/moderacion/components/vacancies/admin-vacancy-detail-view";

type AdminVacancyDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminVacancyDetailPage({
  params,
}: AdminVacancyDetailPageProps) {
  const { id } = await params;

  return <AdminVacancyDetailView vacancyId={id} />;
}
