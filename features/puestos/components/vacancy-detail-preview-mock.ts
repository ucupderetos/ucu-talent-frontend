// 🔴 MOCK EXPLORATORIO — NO es contrato real, es solo para ver cómo se ve la
// pantalla de detalle con más densidad de información. Ninguno de estos campos
// existe hoy en `Vacancy`/`Company` (`types/index.ts`) ni en `docs/ENDPOINTS.md`:
//   - `Vacancy.skills` y `requiresQuestionnaire`: gap A-03 en AGENTS.md (el
//     backend todavía no tiene `skills` en `Vacancy`, necesario para RF-14).
//   - `Company.logoUrl`: gap A-11 en AGENTS.md (no hay endpoint de upload
//     todavía). El logo acá es una imagen de placeholder (dicebear), no un
//     asset real.
//   - `companySize`/`foundedYear`: no están en el MER en absoluto — es la
//     parte más especulativa del mock, a confirmar si el equipo los quiere
//     antes de pedírselos a backend.
// Borrar este archivo (y su uso en vacancy-detail-view.tsx) apenas termine el
// preview, o reemplazarlo por los campos reales cuando el backend los exponga.

import type { VacancyDetail } from "@/features/puestos/types";

export interface VacancyDetailPreviewExtras {
  logoUrl: string;
  companySize: string;
  foundedYear: number;
  skills: string[];
  requiresQuestionnaire: boolean;
}

const SKILLS_BY_AREA: Record<string, string[]> = {
  "a-2": ["React", "TypeScript", "Git"],
  "a-3": ["SQL", "Python", "Power BI"],
  "a-4": ["Marketing digital", "Canva", "Redes sociales"],
  "a-5": ["Negociación", "CRM", "Atención al cliente"],
  "a-6": ["Figma", "Adobe Suite", "UI/UX"],
};

export function getVacancyDetailPreviewExtras(vacancy: VacancyDetail): VacancyDetailPreviewExtras {
  return {
    logoUrl: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(vacancy.company.name)}&backgroundType=solid&backgroundColor=052e66`,
    companySize: "50-200 empleados",
    foundedYear: 2015,
    skills: SKILLS_BY_AREA[vacancy.areaId] ?? ["A confirmar"],
    // Alterna true/false según el id, solo para poder previsualizar los dos casos.
    requiresQuestionnaire: Number(vacancy.vacancyId.replace(/\D/g, "")) % 2 === 0,
  };
}
