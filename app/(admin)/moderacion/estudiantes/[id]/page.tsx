import { StudentDetailView } from "@/features/moderacion/components/students/student-detail-view";

type AdminStudentDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminStudentDetailPage({
  params,
}: AdminStudentDetailPageProps) {
  const { id } = await params;

  return <StudentDetailView studentProfileId={id} />;
}
