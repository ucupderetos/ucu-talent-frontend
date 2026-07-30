# Reglas para el agente

> Parte de [AGENTS.md](../../AGENTS.md) — ver el índice ahí para el resto de los documentos.

**Siempre:**

- Antes de crear un componente nuevo, revisar si ya existe algo similar en `features/`
  o en `components/`.
- Todo fetch a la API pasa por `lib/api-client.ts` — nunca `fetch()` suelto dentro de
  un componente.
- Formularios con React Hook Form + Zod, no manejo de estado de formulario a mano.
- Todo fetching por TanStack Query (`useQuery` / `useMutation`), nunca `useEffect` +
  `useState` para traer datos. El hook va en `features/<dominio>/hooks/`.
- El código de un dominio vive en `features/<dominio>/`, no directamente en `components/`.
- Imports con el alias `@/` (`@/features/puestos/types`), no rutas relativas largas.
- **Todo componente debe ser responsive (mobile + desktop) y funcionar en Chrome, Edge
  y Safari** (RNF-06, RNF-07) — obligatorio, no opcional. No asumir layouts fijos de
  escritorio; usable desde 360px de ancho.
- Nunca commitear credenciales, tokens o archivos `.env` — usar variables de entorno.
- Commits pequeños y descriptivos, trabajo en branches con Pull Request y code review.
  Nombrar ramas y commits según [Nomenclatura de ramas y commits](branch-and-commit-naming.md)
  — no improvisar formato.

**Nunca:**

- No agregar Server Components que hagan fetch de datos de negocio sin discutirlo antes
  — rompe el criterio de "CSR por defecto" de arriba.
- No instalar otra librería de componentes sin confirmar — shadcn/ui es la base.
- No modificar `components/ui/` a mano — se regenera vía CLI de shadcn.
- **No correr `shadcn init` sin `--base radix`** — el default vuelve a Base UI y rompe
  todos los `asChild` del repo.
- **No usar `render={<Componente />}`** para composición: eso es Base UI. Acá es `asChild`.
- **No buscar `components/ui/form` ni `FormField`/`useFormField`** — no existen en esta
  versión. El equivalente es `components/ui/field`.
- **No traer datos con `useEffect` + `useState`** — va `useQuery`, en un hook de
  `features/<dominio>/hooks/`.
- **No crear un Context por dominio para cachear datos** — TanStack Query ya deduplica
  por `queryKey`.
- **No copiar snippets de Zod v3** — acá es v4 y la API cambió.
- **No crear `middleware.ts` NI `proxy.ts`** — el primero no se ejecuta en Next 16 (falla
  en silencio); el segundo se borró a propósito porque no puede leer la cookie de sesión
  cross-domain y causaba un loop de redirección que rompía el login. Ver
  [Roles y control de acceso](roles-and-access-control.md) — "El acceso se valida en tres
  capas".
- **No confiar en los layouts como seguridad** — son UX. La autorización real la hace
  Spring Boot.
- No introducir carpetas tipo `atoms/molecules/organisms`.
- **No armar `mailto:` ni nada de correo desde el frontend** — los dos correos del sistema
  los manda Spring Boot. Ver [Mails](mails.md).
- **No implementar `MailTemplate`, RF-PUE-05 ni RF-POS-04** — están en el SRS v2.1 pero el
  MER los eliminó y el MER es posterior.
- **No traducir los NOMBRES del modelo al español** — los tipos y campos espejan el MER en
  inglés. Los **valores** de enum sí van en español y en mayúscula, como los manda el
  backend: `"ALUMNO"`, no `"student"`. Ver [Idioma del código](language-conventions.md).
- **No implementar nada de la sección *Pendiente de aclarar*** — está listado justamente
  porque falta definirlo. Si algo lo necesita, se frena y se pregunta. Ver
  [Pendiente de aclarar](open-questions.md).
- **No inventar endpoints que `ENDPOINTS.md` no tiene** — si el SRS pide algo que la API
  todavía no expone, se documenta como pendiente y se para ahí.
- No importar desde `features/` de otro dominio. Si algo se comparte, sube a
  `components/`, `lib/`, `types/` o `hooks/` (este último para hooks app-wide que
  dependen de React — la capa de sesión, ver [Estructura de carpetas](folder-structure.md)).
  Sin excepciones "salvo auth": la sesión ya NO vive en `features/auth`, vive en `hooks/`.
- **No importar desde `features/` dentro de `components/`** — la dependencia va al revés:
  `features/` → `components/`, nunca al revés.
- **No armar juegos de datos falsos compartidos** — si una pantalla necesita datos, los
  trae de la API por un hook de TanStack Query.
