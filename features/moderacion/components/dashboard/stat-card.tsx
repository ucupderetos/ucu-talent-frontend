import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  title: string;
  value: string;
  weeklyChange: string;
  icon: LucideIcon;
};

export function StatCard({
  title,
  value,
  weeklyChange,
  icon: Icon,
}: StatCardProps) {
  return (
    <article className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex size-11 items-center justify-center rounded-full bg-slate-100">
          <Icon className="size-5 text-slate-700" />
        </div>

        <div>
          <p className="text-sm text-slate-600">{title}</p>

          <p className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
            {value}
          </p>
        </div>
      </div>

      <p className="mt-5 text-sm font-medium text-emerald-600">
        {weeklyChange}
      </p>
    </article>
  );
}