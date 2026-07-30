"use client";

// Tabla de "Usuarios" (alumnos): de presentación, recibe las filas ya
// resueltas por el hook. La identidad enlaza al detalle y el menú de la última
// columna reutiliza las mismas acciones administrativas de esa pantalla.

import Link from "next/link";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AccountStatusBadge } from "@/features/moderacion/components/account-status-badge";
import { StudentModerationActions } from "@/features/moderacion/components/students/student-moderation-actions";
import { avatarColorFor, personInitials } from "@/features/moderacion/avatar-utils";
import type { StudentRow } from "@/features/moderacion/types";
import type { DocumentType } from "@/types";

const DOCUMENT_TYPE_LABEL: Record<DocumentType, string> = {
  CEDULA_IDENTIDAD: "C.I.",
  DNI: "DNI",
  PASAPORTE: "Pasaporte",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-UY");
}

export function StudentsTable({ rows }: { rows: StudentRow[] }) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Usuario</TableHead>
            <TableHead>Carrera</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fecha de registro</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
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
                  <Avatar>
                    <AvatarFallback className={avatarColorFor(student.studentProfileId)}>
                      {personInitials(student.name, student.surname)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium group-hover:underline group-focus-visible:underline">
                      {student.name} {student.surname}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {DOCUMENT_TYPE_LABEL[student.documentType]} {student.documentNumber}
                    </p>
                  </div>
                </Link>
              </TableCell>
              <TableCell>{student.degreeName}</TableCell>
              <TableCell className="text-muted-foreground">{student.email}</TableCell>
              <TableCell>
                <AccountStatusBadge status={student.status} />
              </TableCell>
              <TableCell>{formatDate(student.registeredAt)}</TableCell>
              <TableCell className="text-right">
                <StudentModerationActions
                  userId={student.studentProfileId}
                  status={student.status}
                  displayName={`${student.name} ${student.surname}`}
                  presentation="menu"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
