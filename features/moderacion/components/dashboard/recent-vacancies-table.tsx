import Link from "next/link";

import type {
  RecentVacancy,
  VacancyStatus,
} from "../../types";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type RecentVacanciesTableProps = {
  vacancies: RecentVacancy[];
};

const statusConfig: Record<
  VacancyStatus,
  {
    label: string;
    className: string;
  }
> = {
  published: {
    label: "Publicada",
    className:
      "border-transparent bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  },
  finalized: {
    label: "Finalizada",
    className:
      "border-transparent bg-amber-100 text-amber-700 hover:bg-amber-100",
  },
  
  rejected: {
    label: "Rechazada",
    className:
      "border-transparent bg-red-100 text-red-700 hover:bg-red-100",
  },
};

export function RecentVacanciesTable({
  vacancies,
}: RecentVacanciesTableProps) {
  return (
    <Card className="flex h-full flex-col overflow-hidden py-0">
      <CardHeader className="px-5 py-2">
        <CardTitle className="text-base font-semibold text-slate-950">
          Ofertas más recientes
        </CardTitle>
      </CardHeader>

      <Separator />

      <CardContent className="min-h-0 flex-1 p-0">
        <div className="max-h-[220px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-white">
              <TableRow>
                <TableHead className="px-5">Puesto</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Publicación</TableHead>
                <TableHead>Postulaciones</TableHead>
                <TableHead className="pr-5">Estado</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {vacancies.map((vacancy) => {
                const status = statusConfig[vacancy.status];

                return (
                  <TableRow key={vacancy.id}>
                    <TableCell className="px-5 font-medium text-slate-950">
                      <Link
                        href={`/ofertas/${vacancy.id}`}
                        className="hover:text-blue-600 hover:underline"
                      >
                        {vacancy.position}
                      </Link>
                    </TableCell>

                    <TableCell className="text-slate-600">
                      {vacancy.company}
                    </TableCell>

                    <TableCell className="text-slate-600">
                      {vacancy.publishedAt}
                    </TableCell>

                    <TableCell className="text-slate-600">
                      {vacancy.applications ?? "—"}
                    </TableCell>

                    <TableCell className="pr-5">
                      <Badge
                        variant="outline"
                        className={status.className}
                      >
                        {status.label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Separator />

      <CardFooter className="mt-auto px-5 py-3">
        <Button
          asChild
          variant="link"
          className="h-auto p-0 text-blue-600"
        >
          <Link href="/ofertas">
            Ver todas las ofertas
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}