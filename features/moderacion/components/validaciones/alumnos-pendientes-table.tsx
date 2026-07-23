"use client";

// la tabla de alumnos pendientes. le pasan las filas ya filtradas.
// los botones de aprobar y rechazar todavia no hacen nada.

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
import type { AlumnoPendienteRow } from "@/features/moderacion/data/alumnos-pendientes-mock";

// colores del avatar, van rotando por fila.
const AVATAR_COLORS = [
  "bg-violet-100 text-violet-700",
  "bg-amber-100 text-amber-700",
  "bg-emerald-100 text-emerald-700",
  "bg-blue-100 text-blue-700",
  "bg-rose-100 text-rose-700",
];

function initials(name: string, surname: string): string {
  return `${name[0]}${surname[0]}`.toUpperCase();
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-UY");
}

interface AlumnosPendientesTableProps {
  rows: AlumnoPendienteRow[];
}

export function AlumnosPendientesTable({ rows }: AlumnosPendientesTableProps) {
  return (
    <div className="rounded-lg border">
      <p className="border-b px-4 py-3 font-medium">
        Estudiantes pendientes ({rows.length})
      </p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Alumno</TableHead>
            <TableHead>Documento</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Fecha de solicitud</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                No hay estudiantes pendientes con estos filtros.
              </TableCell>
            </TableRow>
          )}
          {rows.map((a, index) => (
            <TableRow key={a.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className={AVATAR_COLORS[index % AVATAR_COLORS.length]}>
                      {initials(a.name, a.surname)}
                    </AvatarFallback>
                  </Avatar>
                  <p className="font-medium">
                    {a.name} {a.surname}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                {a.documentType} {a.documentNumber}
              </TableCell>
              <TableCell className="text-muted-foreground">{a.email}</TableCell>
              <TableCell>
                <p>{formatDate(a.solicitadaAt)}</p>
                <p className="text-xs text-muted-foreground">{a.hace}</p>
              </TableCell>
              <TableCell className="text-right">
                {/* los botones todavia no hacen nada */}
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    <CheckIcon data-icon="inline-start" />
                    Aprobar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-600"
                  >
                    <XCircleIcon data-icon="inline-start" />
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
