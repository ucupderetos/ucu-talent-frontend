"use client";

import {
  CheckCircle2Icon,
  EyeIcon,
  MoreVerticalIcon,
  XCircleIcon,
} from "lucide-react";
import { toast } from "sonner";

import type { AdminCompanyRow } from "@/features/moderacion/types";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type CompanyActionsMenuProps = {
  company: AdminCompanyRow;
};

export function CompanyActionsMenu({
  company,
}: CompanyActionsMenuProps) {
  function handleViewDetails() {
    toast.info(`El detalle de ${company.name} todavía no está disponible.`);
  }

  function handleApprove() {
    toast.info(`La aprobación de ${company.name} se conectará con el backend.`);
  }

  function handleReject() {
    toast.info(`El rechazo de ${company.name} se conectará con el backend.`);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`Abrir acciones de ${company.name}`}
        >
          <MoreVerticalIcon aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onClick={handleViewDetails}>
          <EyeIcon aria-hidden="true" />
          Ver detalle
        </DropdownMenuItem>

        {company.status !== "APROBADO" && (
          <DropdownMenuItem onClick={handleApprove}>
            <CheckCircle2Icon aria-hidden="true" />
            Aprobar empresa
          </DropdownMenuItem>
        )}

        {company.status !== "RECHAZADO" && (
          <>
            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleReject}
              className="text-destructive focus:text-destructive"
            >
              <XCircleIcon aria-hidden="true" />
              Rechazar empresa
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}