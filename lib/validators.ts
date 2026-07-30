// Validadores puros de documentos, sin UI ni React — se usan desde los schemas
// de Zod de los formularios de auth (features/auth/components/) y de completar
// perfil (features/perfil/components/).
//
// Solo validación de FORMATO (cantidad y tipo de caracteres): la validez real
// del documento (dígito verificador, existencia en el padrón) la valida el
// backend. El back además limpia separadores (puntos, comas) antes de guardar,
// así que acá `cleanDocumentNumber` hace lo mismo antes de medir el largo: el
// usuario puede tipear "1.234.567-8" y se valida contra "12345678".
// Ver `docs/agents/roles-and-access-control.md` (A-10 en `docs/agents/open-questions.md`).

import type { DocumentType } from "@/types";

/** Saca separadores de formato (puntos, comas, guiones, espacios). El resto
 *  (letras/dígitos) queda para que el validador de cada tipo lo evalúe. */
function cleanDocumentNumber(value: string): string {
  return value.replace(/[.,\-\s]/g, "");
}

/** Reglas de formato por tipo de documento, sobre el número YA limpio.
 *  - CEDULA_IDENTIDAD / DNI: solo dígitos, exactamente 8.
 *  - PASAPORTE: alfanumérico, 6 a 9 caracteres. */
const DOCUMENT_FORMATS: Record<DocumentType, RegExp> = {
  CEDULA_IDENTIDAD: /^\d{8}$/,
  DNI: /^\d{8}$/,
  PASAPORTE: /^[A-Za-z0-9]{6,9}$/,
};

/** `true` si `value` (con o sin separadores) tiene el formato válido para
 *  `documentType`. */
export function isValidDocumentNumber(documentType: DocumentType, value: string): boolean {
  return DOCUMENT_FORMATS[documentType].test(cleanDocumentNumber(value));
}
