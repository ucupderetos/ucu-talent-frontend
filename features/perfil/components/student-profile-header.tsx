// Card de resumen de "Mi perfil": foto de perfil (editable acá mismo) + los
// datos de identidad, de solo lectura. La edición del resto vive en la pestaña
// "Información personal" de más abajo.

import { Card, CardContent } from "@/components/ui/card";
import { ProfileImageUploader } from "@/features/perfil/components/profile-image-uploader";
import { DOCUMENT_TYPE_LABELS } from "@/lib/document-types";
import type { StudentProfile, User } from "@/types";

function initials(name: string, surname: string): string {
  return `${name[0] ?? ""}${surname[0] ?? ""}`.toUpperCase() || "?";
}

export function StudentProfileHeader({
  profile,
  user,
}: {
  profile: StudentProfile;
  user: User;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
        <ProfileImageUploader
          userId={user.userId}
          fallback={initials(profile.name, profile.surname)}
          className="shrink-0"
        />

        <div className="flex flex-1 flex-wrap gap-x-10 gap-y-3">
          <InfoItem label="Nombre completo" value={`${profile.name} ${profile.surname}`} />
          <InfoItem label="Email" value={user.email} />
          <InfoItem
            label="Documento"
            value={`${DOCUMENT_TYPE_LABELS[profile.documentType]} · ${profile.documentNumber}`}
          />
          <InfoItem label="Teléfono" value={profile.phoneNumber ?? "Sin completar"} />
        </div>
      </CardContent>
    </Card>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-32 flex-1 sm:flex-none">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="truncate text-sm font-medium">{value}</p>
    </div>
  );
}
