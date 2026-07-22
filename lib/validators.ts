// Validadores puros de documentos uruguayos, sin UI ni React — se usan desde
// los schemas de Zod de los formularios de auth (features/auth/components/).
//
// Solo validación básica (numérico, no vacío): el backend guarda cédula y RUT
// tal cual se los mandan, sin validarlos — no tiene sentido que el frontend
// imponga reglas (dígito verificador, cantidad exacta de dígitos) que ningún
// lado del sistema termina exigiendo. Ver AGENTS.md, sección de registro.

export function isValidCedulaUruguaya(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  return digits.length > 0 && /^\d+$/.test(digits);
}

export function isValidRutFormat(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  return digits.length > 0 && /^\d+$/.test(digits);
}
