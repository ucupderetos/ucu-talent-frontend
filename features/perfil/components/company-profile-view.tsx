"use client";

// Vista de perfil de empresa: formulario editable + preview + tips.
// Se monta desde /perfil (route group compartido (perfil)) cuando el rol es
// EMPRESA — ver app/(perfil)/perfil/page.tsx.

import { EmptyState } from "@/components/layout/empty-state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/hooks/use-session";
import { CompanyAccountStatusBanner } from "@/features/perfil/components/company-account-status-banner";
import { CompanyProfileForm } from "@/features/perfil/components/company-profile-form";
import { CompanyProfilePreview } from "@/features/perfil/components/company-profile-preview";
import { CompanyProfileTips } from "@/features/perfil/components/company-profile-tips";
import { ProfileImageUploader } from "@/features/perfil/components/profile-image-uploader";
import { useCompanyProfileForm } from "@/features/perfil/hooks/use-company-profile-form";

export function CompanyProfileView() {
  const { form, mode, startEditing, commitSave, cancelEditing, isLoading, isError } =
    useCompanyProfileForm();
  // RoleGuard + ProfileGuard ((empresa)/layout.tsx) ya garantizaron sesión y
  // perfil antes de montar esto — mismo criterio que app/(perfil)/perfil/page.tsx.
  const { user } = useSession();

  return (
    <div className="flex flex-col gap-6">
      {user && <CompanyAccountStatusBanner status={user.status} />}

      {isLoading && <ProfileSkeleton />}

      {!isLoading && isError && (
        <EmptyState
          title="No pudimos cargar el perfil"
          description="Revisá tu conexión y volvé a intentar."
        />
      )}

      {!isLoading && !isError && (
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
            {/* La imagen no es parte del formulario: se sube y se borra sola,
                contra `/user/profile/image`, sin pasar por "Guardar cambios". */}
            {user && (
              <Card>
                <CardHeader>
                  <CardTitle>Imagen de perfil</CardTitle>
                  <CardDescription>
                    El logo con el que te van a ver los estudiantes.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ProfileImageUploader
                    userId={user.userId}
                    fallback={(user.name ?? "?").charAt(0).toUpperCase()}
                  />
                </CardContent>
              </Card>
            )}
            <CompanyProfilePreview form={form} />
            <CompanyProfileTips />
          </div>
        </div>
      )}
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Skeleton className="h-[32rem] w-full rounded-xl" />
      </div>
      <div className="flex flex-col gap-6">
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    </div>
  );
}
