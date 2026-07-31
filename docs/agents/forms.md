# Formularios: React Hook Form + Zod

> Parte de [AGENTS.md](../../AGENTS.md) — ver el índice ahí para el resto de los documentos.

Confirmado por el equipo. Formularios con RHF + Zod (v4), no estado a mano.

⚠️ **`components/ui/form` NO existe en esta versión de shadcn** — el item del registry está
vacío. Lo reemplaza **`components/ui/field`** (`Field`, `FieldLabel`, `FieldError`,
`FieldGroup`, `FieldSet`…), que es **agnóstico de librería**: no depende de RHF. Se
conecta a mano — `FieldError` recibe un array `{ message }`, que es la forma que ya tienen
los errores de RHF.

> Si buscás `FormField` / `useFormField` de los tutoriales de shadcn: no están acá.
> Ese componente es del shadcn viejo sobre Radix+RHF. Usá `field`.
