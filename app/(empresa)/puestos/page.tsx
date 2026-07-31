// Ruta: /puestos — "Mis ofertas" (vista empresa). RF-11/RF-12 desde el lado
// de la empresa: listar, filtrar y ver el estado de sus propias vacantes.
// Página delgada: toda la lógica vive en features/puestos/.

import { CompanyVacanciesView } from "@/features/puestos/components/company-vacancies-view";

export default function PuestosPage() {
  return <CompanyVacanciesView />;
}
