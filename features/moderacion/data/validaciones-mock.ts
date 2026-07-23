// datos de prueba de las empresas pendientes de aprobacion mientras no
// tengamos el back. despues esto se borra y los datos vienen del endpoint.

export interface EmpresaPendienteRow {
  id: string;
  empresa: string;
  rubro: string;
  contacto: string;
  cargo: string;
  email: string;
  solicitadaAt: string; // ISO 8601
  hace: string; // texto tipo "Hace 2 horas"
}

export const EMPRESAS_PENDIENTES_MOCK: EmpresaPendienteRow[] = [
  {
    id: "ep-1",
    empresa: "Agro Sustentable S.A.",
    rubro: "Agroindustria",
    contacto: "Lucía Martínez",
    cargo: "Responsable de RRHH",
    email: "rrhh@agrosustentable.com.uy",
    solicitadaAt: "2026-07-14T10:00:00.000Z",
    hace: "Hace 2 horas",
  },
  {
    id: "ep-2",
    empresa: "Tech Global Uruguay",
    rubro: "Tecnología",
    contacto: "Juan Pérez",
    cargo: "CEO",
    email: "juan.perez@techglobal.com.uy",
    solicitadaAt: "2026-07-13T10:00:00.000Z",
    hace: "Hace 1 día",
  },
  {
    id: "ep-3",
    empresa: "Comercial del Este",
    rubro: "Comercio",
    contacto: "Sofía González",
    cargo: "Gerente de Talento",
    email: "talento@comercialeste.com.uy",
    solicitadaAt: "2026-07-12T10:00:00.000Z",
    hace: "Hace 2 días",
  },
  {
    id: "ep-4",
    empresa: "Salud Integral",
    rubro: "Salud",
    contacto: "María Fernández",
    cargo: "Coordinadora de RRHH",
    email: "rrhh@saludintegral.com.uy",
    solicitadaAt: "2026-07-11T10:00:00.000Z",
    hace: "Hace 3 días",
  },
  {
    id: "ep-5",
    empresa: "Oceanic Solutions",
    rubro: "Servicios",
    contacto: "Agustín Rodríguez",
    cargo: "HR Business Partner",
    email: "agustin.rodriguez@oceanic.com.uy",
    solicitadaAt: "2026-07-10T10:00:00.000Z",
    hace: "Hace 4 días",
  },
];
