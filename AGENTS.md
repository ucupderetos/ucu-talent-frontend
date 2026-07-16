<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AGENTS.md — UCU Talent (Frontend)

> Decisiones de arquitectura del equipo. Actualizado tras el documento de
> requerimientos **v3**. Mantener al día a medida que se tomen nuevas decisiones.
> `CLAUDE.md` referencia este archivo — editar acá, no allá.

## Contexto del proyecto

Portal laboral tipo LinkedIn para la UCU: conecta empresas, alumnos/egresados y
administración universitaria. El backend (Java + Spring Boot) expone una API REST
separada — **este repositorio es solo el frontend**, no genera su propio backend
ni accede directamente a la base de datos.

## Stack

Instalado y en uso:

- Next.js 16 (App Router) + React 19, TypeScript
- Tailwind CSS v4

Confirmado por el equipo, todavía sin implementar:

- shadcn/ui como base de componentes — falta correr `shadcn@latest init`
  *(pendiente: incorporar tokens de diseño propio)*

## Herramientas posibles (no decididas)

Candidatas que el equipo evaluó para problemas que **todavía no tenemos**. No son parte
del stack: no instalarlas ni asumirlas hasta que el equipo lo decida explícitamente.
Si el problema aparece, traerlo a la mesa antes de agregar la dependencia.

| Herramienta | Problema que resolvería |
|---|---|
| TanStack Query | Cache, revalidación y estado de server-state en el fetching CSR |
| React Hook Form | Manejo de formularios grandes sin re-renders |
| Zod | Validación de formularios y parseo/tipado de respuestas de la API |

## Decisiones de arquitectura

### Next.js: router y guard de acceso, no motor SSR

- Casi todo el contenido está detrás de login → no hay SEO que ganar.
- Los datos son personalizados por usuario/rol → no hay nada estático para cachear.
- **El fetching de datos de negocio se hace en Client Components (`"use client"`)**, no en
  Server Components, salvo que se justifique explícitamente un caso puntual y se discuta
  con el equipo antes. (Con qué librería se maneja ese fetching todavía no está decidido
  — ver *Herramientas posibles*.)
- El valor real de Next.js acá es: route groups por rol, layouts anidados y middleware
  para control de acceso — no el renderizado del lado del servidor.
- (v3 bajó el requisito de rendimiento del feed a "opcional" — no cambia esta decisión,
  las otras razones siguen aplicando igual.)

### Organización de código: feature-based

- Agrupar por dominio de negocio en `features/<dominio>/`, no por tipo de archivo ni por
  capas técnicas.
- Dominios actuales: `auth`, `perfil`, `puestos`, `postulaciones`, `moderacion`.
- No usar convenciones de Atomic Design (`atoms/`, `molecules/`, `organisms/`).

### Roles y control de acceso (RF-03, RBAC)

- 3 roles: **alumno**, **empresa**, **admin**. Cada uno ve solo lo que le corresponde.
- Alumno: se valida contra padrón de cédulas o mail `@ucu` (RF-01).
- Empresa: se registra o es invitada, y **necesita aprobación de Admin UCU antes de
  poder operar** (RF-13) — el gate de aprobación es sobre la empresa, no sobre cada
  puesto individual.
- Puesto: **se publica por default al crearse** (ya no existe estado "pendiente de
  aprobación"). Admin UCU puede rechazar/despublicar un puesto ya publicado (RF-12),
  no aprueba antes de que salga. Estados: `publicado / pausado / finalizado / eliminado`.
- Cada route group (`(auth)`, `(alumno)`, `(empresa)`, `(admin)`) lleva su propio
  `layout.tsx` que valida el rol antes de renderizar.
- `middleware.ts` es la primera línea de defensa: bloquea/redirige antes de que se
  renderice cualquier página protegida.
- **Pendiente de confirmar con backend**: si el JWT viaja en cookie `httpOnly` (permite
  validar en middleware) o se maneja solo en el cliente. No asumir una opción sin
  confirmarlo — impacta directamente cómo se implementa el guard.

### Plantillas de mail (RF-21) — nuevo en v3

- La empresa contacta a un postulante (avanza/rechazado) con una plantilla predefinida,
  disparada como link `mailto:` — **no** es envío automático de mails desde el backend.
- Vive dentro de `features/postulaciones/` (se dispara desde la gestión de postulantes).
  Si el equipo prefiere aislarlo, evaluar `features/mensajeria/` — no crear esa carpeta
  hasta confirmar el alcance real (ver *Pendiente de aclarar*).

## Estructura de carpetas

**No hay `src/`: la raíz del repo es el src.** El alias `@/*` apunta a la raíz (`./*`).

```
app/                        # Rutas (App Router) — casi sin lógica de negocio
├── (auth)/{login,registro}/
├── (alumno)/{feed,perfil,postulaciones}/
├── (empresa)/puestos/[id]/postulantes/
├── (admin)/moderacion/
├── layout.tsx              # Layout raíz: <html>/<body>, estilos y providers globales
└── page.tsx                # Home (/)
components/
├── ui/                     # shadcn — no editar a mano, se regenera vía CLI
└── layout/                 # Navbar, sidebar, shells — compartidos entre roles
features/<dominio>/         # auth, perfil, puestos, postulaciones, moderacion
├── components/             # Componentes propios del dominio
├── hooks/                  # Hooks de datos/estado del dominio
└── types.ts                # Tipos del dominio
lib/
├── api-client.ts           # Wrapper de fetch hacia la API de Spring Boot
└── auth.ts                 # Sesión, token, usuario actual, guards de rol
types/
└── index.ts                # Tipos globales (User, Rol)
```

Qué va en cada lado:

- **`app/`** — solo routing y composición. Una carpeta = un segmento de URL; la ruta
  existe recién cuando la carpeta tiene un `page.tsx`. Páginas delgadas: importan de
  `features/` y componen. Sin lógica de dominio ni fetching acá.
- **`(paréntesis)`** — route group: agrupa por rol sin agregar segmento a la URL.
  `app/(alumno)/feed/` sirve `/feed`, no `/alumno/feed`.
- **`[corchetes]`** — segmento dinámico (`/puestos/123/postulantes`).
- **`features/<dominio>/`** — el default: ante la duda, va acá y no en `app/` ni en
  `components/`.
- **`components/layout/`** — UI compartida entre roles, sin lógica de dominio.
- **`components/ui/`** — la genera `shadcn@latest init`; no crearla a mano.
- **`lib/`** — infraestructura transversal, sin UI.
- **`types/index.ts`** — tipos usados por más de un dominio. Los específicos van en
  `features/<x>/types.ts`.

## Reglas para el agente

**Siempre:**

- Antes de crear un componente nuevo, revisar si ya existe algo similar en `features/`
  o en `components/`.
- Todo fetch a la API pasa por `lib/api-client.ts` — nunca `fetch()` suelto dentro de
  un componente.
- Formularios con React Hook Form + Zod, no manejo de estado de formulario a mano.
- El código de un dominio vive en `features/<dominio>/`, no directamente en `components/`.
- Imports con el alias `@/` (`@/features/puestos/types`), no rutas relativas largas.
- **Todo componente debe ser responsive (mobile + desktop) y funcionar en Chrome, Edge
  y Safari** — desde v3 es obligatorio, no opcional. No asumir layouts fijos de escritorio.
- Nunca commitear credenciales, tokens o archivos `.env` — usar variables de entorno.
- Commits pequeños y descriptivos, trabajo en branches con Pull Request y code review.

**Nunca:**

- No agregar Server Components que hagan fetch de datos de negocio sin discutirlo antes
  — rompe el criterio de "CSR por defecto" de arriba.
- No instalar otra librería de componentes sin confirmar — shadcn/ui es la base.
- No modificar `components/ui/` a mano — se regenera vía CLI de shadcn.
- No introducir carpetas tipo `atoms/molecules/organisms`.
- No implementar envío automático de mails/push — solo el flujo `mailto:` de RF-21 está
  confirmado en alcance.
- No asumir los nombres exactos de los estados de una postulación (`avanza` vs
  `aceptado`) sin confirmarlos — ver *Pendiente de aclarar*.
- No importar desde `features/` de otro dominio. Si algo se comparte, sube a
  `components/`, `lib/` o `types/`.

## Convención de trabajo en equipo

- Una pantalla = una carpeta de ruta; quien la toma es dueño de ese `page.tsx`.
- La lógica va en `features/<x>/`, no en la carpeta de ruta: así dos personas en dominios
  distintos casi no tocan los mismos archivos.
- `components/layout/`, `lib/` y `types/index.ts` son puntos de conflicto: coordinar
  antes de tocarlos.

## Estado actual del repo

Estructura scaffolded con stubs. **Lo de abajo está decidido pero todavía NO existe** —
no asumir que está:

- `components/ui/` y el theming: falta correr `shadcn@latest init`.
- `middleware.ts`: no existe.
- `layout.tsx` por route group (el que valida rol): no existen todavía.
- `lib/api-client.ts` y `lib/auth.ts`: stubs vacíos. El backend es Spring Boot, pero el
  contrato de la API (endpoints, base URL, forma de auth) todavía no está definido.
- Las `page.tsx` de cada ruta son placeholders.

## Pendiente de aclarar (inconsistencias del documento de requerimientos v3)

El documento v3 se contradice entre secciones. No resolver por cuenta propia —
confirmar con el equipo/docente antes de construir sobre estos supuestos:

- **Estado de postulación**: RF-20 y el flujo 6.3 usan "avanza", pero el modelo de datos
  dice "aceptado". Confirmar antes de tipar el enum en el frontend.
- **Formato de import de LinkedIn**: RF-05 dice ZIP/CSV/PDF/txt, el flujo 6.2 dice
  PDF/DOCX. Confirmar qué soporta realmente el backend.
- **Notificaciones**: la sección 3.1 las incluye en alcance, la 3.2 las excluye. Se asume
  `mailto:` (RF-21) y no envío automático — confirmar antes de cerrar el alcance.
- **Orden del feed por "coincidencia" (RF-14)**: podría leerse como motor de matching, lo
  cual choca con "fuera de alcance: recomendación con IA/ML" (3.2). Confirmar si es un
  ordenamiento simple por reglas (carrera/skills en común) o si sale del MVP.
- **Import de LinkedIn bajó de prioridad Alta a Baja** (RF-05/06/07) — no bloquea el MVP,
  se puede dejar para el final del sprint.

## Fuera de alcance del proyecto

Según el documento de requerimientos (v3): integración en vivo con la API de LinkedIn,
video-CV, interfaz tipo "Tinder del empleo", chat en tiempo real, motor de recomendación
con IA/ML/ranking automático de candidatos, envío automático de notificaciones push o por
correo (más allá del `mailto:` de RF-21), pagos/suscripciones, testing automatizado,
CI/CD y despliegue en la nube.
