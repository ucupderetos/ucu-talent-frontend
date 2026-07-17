// Estado vacío. Los 3 roles tienen listas que arrancan vacías (feed sin vacantes,
// sin postulantes, sin nada para moderar) — que todas se vean igual.

import { InboxIcon, type LucideIcon } from "lucide-react";

export function EmptyState({
  title,
  description,
  icon: Icon = InboxIcon,
  action,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed px-6 py-12 text-center">
      <Icon className="size-8 text-muted-foreground" aria-hidden />
      <p className="mt-4 font-medium">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
