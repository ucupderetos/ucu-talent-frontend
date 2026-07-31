// la pagina solo llama a la vista, todo lo demas esta en features/moderacion.

import { AdminDashboard } from "@/features/moderacion/components/dashboard/admin-dashboard";

export default function DashboardPage() {
  return <AdminDashboard />;
}
