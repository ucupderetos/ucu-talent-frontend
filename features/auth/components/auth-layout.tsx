import Image from "next/image";
import Link from "next/link";

import { Skeleton } from "@/components/ui/skeleton";

// Shell visual de las pantallas de auth (login, registro): panel de marca +
// columna de contenido. Vive en app/(auth)/layout.tsx y se renderiza SIEMPRE,
// antes de saber si hay sesión o no — así GuestOnly solo cambia lo que va
// adentro (skeleton vs. formulario) y no hay salto de layout al cargar.
export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-white">
      <div className="hidden lg:block lg:w-[38.2%] lg:p-6">
        <div className="relative flex h-full w-full flex-col overflow-hidden rounded-2xl bg-ucu-blue px-12 py-10 xl:px-16">
          <div
            className="pointer-events-none absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full opacity-10"
            style={{
              background:
                "radial-gradient(circle, rgb(255,255,255) 0%, transparent 70%)",
            }}
          />
          <div
            className="pointer-events-none absolute -bottom-24 -left-24 h-[400px] w-[400px] rounded-full opacity-[0.07]"
            style={{
              background:
                "radial-gradient(circle, rgb(255,255,255) 0%, transparent 70%)",
            }}
          />

          {/* El SVG trae ~7% de padding interno a cada lado (el archivo lo
              trae así), -ml-3 compensa para que el trazo visible arranque
              alineado con el texto de abajo, no con el borde del <Image>. */}
          <Link href="/" className="relative z-10 -ml-3 w-fit">
            <Image
              src="/logo-ucu.svg"
              alt="Universidad Católica del Uruguay"
              width={180}
              height={69}
              className="h-16 w-auto object-contain brightness-0 invert"
              priority
            />
          </Link>

          <div className="relative z-10 flex flex-1 flex-col justify-center">
            <div className="mb-6 flex gap-2">
              <span className="h-1.5 w-8 rounded-full bg-ucu-orange" />
              <span className="h-1.5 w-6 rounded-full bg-ucu-teal" />
            </div>
            <h2 className="text-4xl font-bold leading-[1.1] text-white">
              Portal <span className="text-ucu-teal">LABORAL</span>
              <br />
              UCU
            </h2>
            <p className="mt-4 max-w-xs text-base leading-relaxed text-white/70">
              Conocé las{" "}
              <span className="font-bold text-ucu-orange">oportunidades laborales</span> que te
              esperan.
            </p>
          </div>

          <p className="relative z-10 text-sm text-white/50">
            © 2026 Universidad Católica del Uruguay
          </p>
        </div>
      </div>

      {/* Sin lg:items-center: haría que el max-w-lg de abajo se achique al
          contenido de cada page en vez de tener un ancho fijo real. */}
      <div className="flex w-full flex-col px-6 py-8 sm:px-10 lg:w-[61.8%] lg:justify-center lg:px-12 lg:py-12">
        <div className="mb-10 lg:hidden">
          <Image
            src="/logo-ucu.svg"
            alt="Universidad Católica del Uruguay"
            width={140}
            height={54}
            className="h-10 w-auto"
            priority
          />
        </div>

        <div className="flex flex-1 items-center justify-center lg:flex-none">
          <div className="w-full max-w-lg">{children}</div>
        </div>
      </div>
    </div>
  );
}

/** Título + subtítulo de una pantalla de auth (login, registro). */
export function AuthHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-8">
      <h1 className="text-[2.618rem] font-bold leading-[1.1] tracking-tight text-foreground">
        {title}
      </h1>
      <p className="mt-2 text-base leading-[1.618] text-muted-foreground">{subtitle}</p>
    </div>
  );
}

/**
 * Placeholder de un formulario de auth mientras `GuestOnly` resuelve la
 * sesión — mismo alto de campo (`h-12`) y mismo `gap-5` que `FieldGroup`,
 * para que no salte el layout al pasar del skeleton al formulario real.
 */
export function AuthFormSkeleton({ fields }: { fields: number }) {
  return (
    <div className="flex w-full flex-col gap-5">
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="flex flex-col gap-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-12 w-full" />
        </div>
      ))}
      <Skeleton className="h-12 w-full" />
      <Skeleton className="mx-auto h-5 w-48" />
    </div>
  );
}
