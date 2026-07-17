import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Genera .next/standalone con solo los archivos necesarios para producción,
  // sin depender de copiar node_modules completo a la imagen final.
  output: "standalone",
};

export default nextConfig;
