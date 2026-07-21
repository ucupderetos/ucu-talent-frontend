import { recentVacanciesMock, pendingCompanyValidationsMock, recentActivitiesMock, applicationsByStatusMock} from "../../data/dashboard-mock";

import { ApplicationsByStatus } from "./applications-by-status";
import { DashboardHeader } from "./dashboard-header";
import { PendingValidations } from "./pending-validations";
import { RecentActivity } from "./recent-activity";
import { RecentVacanciesTable } from "./recent-vacancies-table";
import { StatsGrid } from "./stats-grid";

export function AdminDashboard() {
  return (
    <div className="space-y-6">
      <DashboardHeader />

      <StatsGrid />

      <div className="grid gap-6 xl:grid-cols-2">
        <RecentActivity activities={recentActivitiesMock} />
        <ApplicationsByStatus statuses={applicationsByStatusMock} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <RecentVacanciesTable vacancies={recentVacanciesMock} />

        <PendingValidations validations={pendingCompanyValidationsMock} />
      </div>
    </div>
  );
}