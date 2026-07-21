import {

  BriefcaseBusiness,

  Building2,

  FileUser,

  Users,

} from "lucide-react";

import { StatCard } from "./stat-card";

export function StatsGrid() {

  return (

    <section

      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"

      aria-label="Resumen general"

    >

      <StatCard

        title="Empresas registradas"

        value="126"

        weeklyChange="+8 esta semana"

        icon={Building2}

      />

      <StatCard

        title="Ofertas publicadas"

        value="248"

        weeklyChange="+15 esta semana"

        icon={BriefcaseBusiness}

      />

      <StatCard

        title="Postulaciones"

        value="1.842"

        weeklyChange="+120 esta semana"

        icon={FileUser}

      />

      <StatCard

        title="Usuarios registrados"

        value="2.356"

        weeklyChange="+95 esta semana"

        icon={Users}

      />

    </section>

  );

}