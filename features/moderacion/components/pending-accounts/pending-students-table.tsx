"use client";

// tabla de alumnos pendientes. recibe las filas ya filtradas. aprobar y
// rechazar no hacen nada todavia, no hay endpoint para eso.

import { CheckIcon, MoreVerticalIcon, XCircleIcon } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    <CheckIcon />
                    Aprobar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-600"
                  >
                    <XCircleIcon />
                    Rechazar
                  </Button>
                  <Button variant="ghost" size="icon" aria-label="Más acciones">
                    <MoreVerticalIcon />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
