"use client";

// Tabla de "Usuarios" (alumnos): de presentación, recibe las filas ya
// resueltas por el hook. El menú de acciones todavía no hace nada — no hay
// endpoint (ver aviso en features/moderacion/types.ts).

import { MoreVerticalIcon } from "lucide-react";

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
import type { StudentRow } from "@/features/moderacion/types";
import type { DocumentType } from "@/types";

const DOCUMENT_TYPE_LABEL: Record<DocumentType, string> = {
  CEDULA_IDENTIDAD: "C.I.",
  DNI: "DNI",
  PASAPORTE: "Pasaporte",
};

// Colores semánticos (tokens `--chart-*` de globals.css), no la paleta cruda
// de Tailwind. El color de cada avatar sale de un hash del id — es estable
// sin importar en qué página caiga la fila (no rota por índice).
const AVATAR_COLOR_CLASSES = [
  "bg-chart-1/15 text-chart-1",
  "bg-chart-2/15 text-chart-2",
  "bg-chart-3/15 text-chart-3",
  "bg-chart-4/15 text-chart-4",
  "bg-chart-5/15 text-chart-5",
];

function avatarColorFor(id: string): string {
  let hash = 0;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) % AVATAR_COLOR_CLASSES.length;
  return AVATAR_COLOR_CLASSES[hash];
}

function initials(name: string, surname: string): string {
  return `${name[0]}${surname[0]}`.toUpperCase();
}

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
            <TableHead>Fecha de registro</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((student) => (
            <TableRow key={student.studentProfileId}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className={avatarColorFor(student.studentProfileId)}>
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
              <TableCell>{student.degreeName}</TableCell>
              <TableCell className="text-muted-foreground">{student.email}</TableCell>
              <TableCell>{formatDate(student.registeredAt)}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" aria-label="Acciones">
                  <MoreVerticalIcon />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
