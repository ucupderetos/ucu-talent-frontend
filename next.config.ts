import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Genera .next/standalone con solo los archivos necesarios para producción,
  // sin depender de copiar node_modules completo a la imagen final.
  output: "standalone",

  // /moderacion dejó de ser una pantalla y pasó a ser el segmento padre de las
  // de admin (/moderacion/ofertas, /validaciones, /usuarios, /postulaciones).
  // Va acá y no como page.tsx con `redirect()`: una page prerenderizada
  // responde 200 y recién salta al hidratar; esto es un 308 de verdad, sin JS.
  async redirects() {
    return [
      { source: "/moderacion", destination: "/moderacion/dashboard", permanent: true },
    ];
  },
};

export default nextConfig;
