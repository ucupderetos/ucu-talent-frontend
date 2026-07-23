// Card de resumen de "Mi perfil": avatar (iniciales — sin foto, A-11 no tiene
// endpoint de upload todavía) + los datos de identidad, de solo lectura. La
// edición vive en la pestaña "Información personal" de más abajo.

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import type { DocumentType, StudentProfile, User } from "@/types";

const DOCUMENT_TYPE_LABEL: Record<DocumentType, string> = {
  CEDULA_IDENTIDAD: "Cédula de Identidad",
  DNI: "DNI",
  PASAPORTE: "Pasaporte",
};

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
        <Avatar size="lg" className="size-16">
          <AvatarFallback className="text-lg font-medium">
            {initials(profile.name, profile.surname)}
          </AvatarFallback>
        </Avatar>

        <div className="grid flex-1 grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
          <InfoItem label="Nombre completo" value={`${profile.name} ${profile.surname}`} />
          <InfoItem label="Email" value={user.email} />
          <InfoItem
            label="Documento"
            value={`${DOCUMENT_TYPE_LABEL[profile.documentType]} · ${profile.documentNumber}`}
          />
          <InfoItem label="Teléfono" value={profile.phoneNumber ?? "Sin completar"} />
        </div>
      </CardContent>
    </Card>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="truncate text-sm font-medium">{value}</p>
    </div>
  );
}
