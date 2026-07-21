// el cartelito de color segun el estado de la postulacion.

import type { EstadoPostulacion } from "@/features/moderacion/data/postulaciones-mock";

const ESTADO_COLORS: Record<EstadoPostulacion, string> = {
  "En evaluación": "bg-blue-100 text-blue-700",
  Entrevista: "bg-violet-100 text-violet-700",
  Preseleccionado: "bg-emerald-100 text-emerald-700",
  "En revisión": "bg-amber-100 text-amber-700",
  "No seleccionado": "bg-rose-100 text-rose-700",
  Retirado: "bg-slate-100 text-slate-600",
};

export function PostulacionStatusBadge({ estado }: { estado: EstadoPostulacion }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${ESTADO_COLORS[estado]}`}
    >
      {estado}
    </span>
  );
}
