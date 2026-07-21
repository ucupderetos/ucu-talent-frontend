"use client";

// la tabla de postulaciones. le pasan las filas ya filtradas y ordenadas.
// los botones de ver y acciones todavia no hacen nada.

import { ArrowUpDownIcon, EyeIcon, MoreVerticalIcon } from "lucide-react";

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
import { PostulacionStatusBadge } from "@/features/moderacion/components/postulaciones/postulacion-status-badge";
import type { PostulacionRow } from "@/features/moderacion/data/postulaciones-mock";

// colores del avatar del postulante, van rotando por fila.
const AVATAR_COLORS = [
  "bg-violet-100 text-violet-700",
  "bg-amber-100 text-amber-700",
  "bg-emerald-100 text-emerald-700",
  "bg-blue-100 text-blue-700",
  "bg-rose-100 text-rose-700",
];

// colores del logo de la empresa, uno fijo por nombre.
const COMPANY_COLORS = [
  "bg-slate-800 text-white",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
];

function initials(name: string, surname: string): string {
  return `${name[0]}${surname[0]}`.toUpperCase();
}

function companyInitials(empresa: string): string {
  return empresa
    .split(" ")
    .filter((word) => /^[A-ZÁÉÍÓÚ]/.test(word))
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function companyColor(empresa: string): string {
  let hash = 0;
  for (const char of empresa) hash += char.charCodeAt(0);
  return COMPANY_COLORS[hash % COMPANY_COLORS.length];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-UY");
}

interface PostulacionesTableProps {
  rows: PostulacionRow[];
  onToggleSort: () => void;
}

export function PostulacionesTable({ rows, onToggleSort }: PostulacionesTableProps) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Postulante</TableHead>
            <TableHead>Oferta</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead>
              <button
                type="button"
                onClick={onToggleSort}
                className="inline-flex items-center gap-1 hover:text-foreground"
              >
                Fecha de postulación
                <ArrowUpDownIcon className="size-3.5" />
              </button>
            </TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                No se encontraron postulaciones con estos filtros.
              </TableCell>
            </TableRow>
          )}
          {rows.map((p, index) => (
            <TableRow key={p.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className={AVATAR_COLORS[index % AVATAR_COLORS.length]}>
                      {initials(p.name, p.surname)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {p.name} {p.surname}
                    </p>
                    <p className="text-xs text-muted-foreground">{p.email}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <p>{p.oferta}</p>
                <p className="text-xs text-muted-foreground">ID: {p.ofertaId}</p>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span
                    className={`flex size-8 shrink-0 items-center justify-center rounded-md text-xs font-semibold ${companyColor(p.empresa)}`}
                  >
                    {companyInitials(p.empresa)}
                  </span>
                  <span className="whitespace-nowrap">{p.empresa}</span>
                </div>
              </TableCell>
              <TableCell>
                <p>{formatDate(p.appliedAt)}</p>
                <p className="text-xs text-muted-foreground">{p.hace}</p>
              </TableCell>
              <TableCell>
                <PostulacionStatusBadge estado={p.estado} />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="icon" aria-label="Ver">
                    <EyeIcon />
                  </Button>
                  <Button variant="ghost" size="icon" aria-label="Acciones">
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
