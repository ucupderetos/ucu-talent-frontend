"use client";

// la tabla de empresas pendientes. le pasan las filas ya filtradas y
// ordenadas. los botones de aprobar, rechazar y ver informacion todavia
// no hacen nada.

import { ArrowUpDownIcon, CheckIcon, MoreVerticalIcon, XCircleIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { EmpresaPendienteRow } from "@/features/moderacion/data/validaciones-mock";

// colores del logo de la empresa, uno fijo por nombre.
const COMPANY_COLORS = [
  "bg-emerald-100 text-emerald-700",
  "bg-violet-100 text-violet-700",
  "bg-amber-100 text-amber-700",
  "bg-blue-100 text-blue-700",
  "bg-teal-100 text-teal-700",
];

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

interface EmpresasPendientesTableProps {
  rows: EmpresaPendienteRow[];
  onToggleSort: () => void;
}

export function EmpresasPendientesTable({ rows, onToggleSort }: EmpresasPendientesTableProps) {
  return (
    <div className="rounded-lg border">
      <p className="border-b px-4 py-3 font-medium">
        Empresas pendientes ({rows.length})
      </p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Empresa</TableHead>
            <TableHead>Contacto</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>
              <button
                type="button"
                onClick={onToggleSort}
                className="inline-flex items-center gap-1 hover:text-foreground"
              >
                Fecha de solicitud
                <ArrowUpDownIcon className="size-3.5" />
              </button>
            </TableHead>
            <TableHead>Detalle</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                No se encontraron empresas con estos filtros.
              </TableCell>
            </TableRow>
          )}
          {rows.map((e) => (
            <TableRow key={e.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <span
                    className={`flex size-9 shrink-0 items-center justify-center rounded-md text-xs font-semibold ${companyColor(e.empresa)}`}
                  >
                    {companyInitials(e.empresa)}
                  </span>
                  <div>
                    <p className="font-medium">{e.empresa}</p>
                    <p className="text-xs text-muted-foreground">{e.rubro}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <p>{e.contacto}</p>
                <p className="text-xs text-muted-foreground">{e.cargo}</p>
              </TableCell>
              <TableCell className="text-muted-foreground">{e.email}</TableCell>
              <TableCell>
                <p>{formatDate(e.solicitadaAt)}</p>
                <p className="text-xs text-muted-foreground">{e.hace}</p>
              </TableCell>
              <TableCell>
                {/* todavia no hace nada */}
                <button type="button" className="text-sm text-primary hover:underline">
                  Ver información
                </button>
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
