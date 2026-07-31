"use client";

// tabla de alumnos pendientes. recibe las filas ya filtradas. las acciones
// (Aprobar/Rechazar, con confirmación y motivo) las maneja ReviewActions.

import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ReviewActions } from "@/features/moderacion/components/pending-accounts/review-actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSignedProfileImageUrl } from "@/hooks/use-profile-image";
import { avatarColorFor, initialsFrom } from "@/lib/avatar";
import { DOCUMENT_TYPE_LABELS } from "@/lib/document-types";
import type { PendingStudentRow } from "@/features/moderacion/types";

function formatDate(iso: string): string {
  return iso ? new Date(iso).toLocaleDateString("es-UY") : "—";
}

// La key de storage ya viene en la fila (`PendingStudentRow.profileImage`), así que
// solo falta canjearla por la URL firmada. Con `useProfileImage(id)` cada fila
// dispararía además un `GET /user/{id}` para releer esa misma key — el N+1 que
// A-24 (`docs/agents/open-questions.md`) decidió no pagar en pantallas de lista.
function PendingStudentAvatar({ student }: { student: PendingStudentRow }) {
  const { imageUrl } = useSignedProfileImageUrl(student.profileImage);

  return (
    <Avatar>
      {imageUrl && <AvatarImage src={imageUrl} alt="" />}
      <AvatarFallback className={avatarColorFor(student.studentProfileId)}>
        {student.hasProfile ? initialsFrom(student.name, student.surname) : "?"}
      </AvatarFallback>
    </Avatar>
  );
}

export function PendingStudentsTable({ rows }: { rows: PendingStudentRow[] }) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Alumno</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Fecha de solicitud</TableHead>
            <TableHead className="pl-4">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((student) => (
            <TableRow key={student.studentProfileId}>
              <TableCell>
                <Link
                  href={`/moderacion/estudiantes/${student.studentProfileId}`}
                  aria-label={`Ver información de ${student.name} ${student.surname}`}
                  className="group flex items-center gap-3 rounded-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <PendingStudentAvatar student={student} />
                  <div>
                    <p className="font-medium group-hover:underline group-focus-visible:underline">
                      {student.hasProfile ? `${student.name} ${student.surname}` : student.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {student.hasProfile && student.documentType
                        ? `${DOCUMENT_TYPE_LABELS[student.documentType]} ${student.documentNumber}`
                        : "Perfil incompleto"}
                    </p>
                  </div>
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground">{student.email}</TableCell>
              <TableCell>{formatDate(student.registeredAt)}</TableCell>
              <TableCell>
                <ReviewActions
                  userId={student.studentProfileId}
                  displayName={
                    student.hasProfile ? `${student.name} ${student.surname}` : student.email
                  }
                  accountType="ALUMNO"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
