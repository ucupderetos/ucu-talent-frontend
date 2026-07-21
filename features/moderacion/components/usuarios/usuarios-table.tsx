"use client";

// la tabla de usuarios. le pasan las filas ya filtradas y ordenadas.
// el boton de acciones todavia no hace nada.

import { ArrowUpDownIcon, MoreVerticalIcon } from "lucide-react";

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
import type { UsuarioRow } from "@/features/moderacion/data/usuarios-mock";

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

interface UsuariosTableProps {
  rows: UsuarioRow[];
  onToggleSort: () => void;
}

export function UsuariosTable({ rows, onToggleSort }: UsuariosTableProps) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Usuario</TableHead>
            <TableHead>Carrera</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>
              <button
                type="button"
                onClick={onToggleSort}
                className="inline-flex items-center gap-1 hover:text-foreground"
              >
                Fecha de registro
                <ArrowUpDownIcon className="size-3.5" />
              </button>
            </TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                No se encontraron usuarios con estos filtros.
              </TableCell>
            </TableRow>
          )}
          {rows.map((usuario, index) => (
            <TableRow key={usuario.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className={AVATAR_COLORS[index % AVATAR_COLORS.length]}>
                      {initials(usuario.name, usuario.surname)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {usuario.name} {usuario.surname}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      C.I. {usuario.documentNumber}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>{usuario.degree}</TableCell>
              <TableCell className="text-muted-foreground">{usuario.email}</TableCell>
              <TableCell>{formatDate(usuario.registeredAt)}</TableCell>
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
