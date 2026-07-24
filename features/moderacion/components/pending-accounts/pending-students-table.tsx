"use client";

// tabla de alumnos pendientes. recibe las filas ya filtradas. las acciones
// (Aprobar/Rechazar, con confirmación y motivo) las maneja ReviewActions.

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ReviewActions } from "@/features/moderacion/components/pending-accounts/review-actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PendingStudentRow } from "@/features/moderacion/types";
import type { DocumentType } from "@/types";

const DOCUMENT_TYPE_LABEL: Record<DocumentType, string> = {
  CEDULA_IDENTIDAD: "C.I.",
  DNI: "DNI",
  PASAPORTE: "Pasaporte",
};

const COLOR_CLASSES = [
  "bg-chart-1/15 text-chart-1",
  "bg-chart-2/15 text-chart-2",
  "bg-chart-3/15 text-chart-3",
  "bg-chart-4/15 text-chart-4",
  "bg-chart-5/15 text-chart-5",
];

function colorFor(id: string): string {
  let hash = 0;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) % COLOR_CLASSES.length;
  return COLOR_CLASSES[hash];
}

function initials(name: string, surname: string): string {
  return `${name[0]}${surname[0]}`.toUpperCase();
}

function formatDate(iso: string): string {
  return iso ? new Date(iso).toLocaleDateString("es-UY") : "—";
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
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((student) => (
            <TableRow key={student.studentProfileId}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className={colorFor(student.studentProfileId)}>
                      {initials(student.name, student.surname)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {student.name} {student.surname}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {DOCUMENT_TYPE_LABEL[student.documentType]} {student.documentNumber}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">{student.email}</TableCell>
              <TableCell>{formatDate(student.registeredAt)}</TableCell>
              <TableCell className="text-right">
                <ReviewActions
                  userId={student.studentProfileId}
                  displayName={`${student.name} ${student.surname}`}
                  accountType="student"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
