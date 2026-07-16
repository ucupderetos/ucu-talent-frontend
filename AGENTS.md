# CLAUDE.md — UCU Talent (Frontend)

> Resume las decisiones de arquitectura tomadas por el equipo hasta ahora.
> Actualizado tras el cambio al documento de requerimientos **v3**.
> Seguir actualizando este archivo a medida que se tomen nuevas decisiones — no dejar que quede desactualizado.

## Contexto del proyecto

Portal laboral tipo LinkedIn para la UCU: conecta empresas, alumnos/egresados y
administración universitaria. El backend (Java + Spring Boot) expone una API REST
separada — **este repositorio es solo el frontend**, no genera su propio backend
ni accede directamente a la base de datos.

## Stack confirmado

- React + Next.js (App Router), TypeScript
- Tailwind CSS
- shadcn/ui como base de componentes *(pendiente: incorporar código/tokens de diseño personalizado)*
- TanStack Query para data fetching
- React Hook Form + Zod para formularios

## Decisiones de arquitectura

### Next.js: como router y guard de acceso, no como motor SSR

- Casi todo el contenido está detrás de login → no hay SEO que ganar.
- Los datos son personalizados por usuario/rol → no hay nada estático para cachear.
- **El fetching de datos de negocio se hace en Client Components (`"use client"`) con
  TanStack Query**, no en Server Components, salvo que se justifique explícitamente un
  caso puntual y se discuta con el equipo antes.
- El valor real de Next.js en este proyecto es: route groups por rol, layouts anidados,
  y middleware para el control de acceso — no el renderizado del lado del servidor.
- (v3 bajó el requisito de rendimiento del feed a "opcional" — no cambia esta decisión,
  las otras razones siguen aplicando igual.)

### Organización de código: feature-based

- Agrupar por dominio de negocio en `src/features/<dominio>/`, no por tipo de archivo
  ni por capas técnicas.
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
  no aprueba antes de que salga. Estados posibles: `publicado / pausado / finalizado /
  eliminado`.
- Route groups en `app/`: `(auth)`, `(alumno)`, `(empresa)`, `(admin)`, cada uno con su
  propio `layout.tsx` que valida el rol antes de renderizar.
- `middleware.ts` es la primera línea de defensa: bloquea/redirige antes de que se
  renderice cualquier página protegida.
- **Pendiente de confirmar con el equipo de backend**: si el JWT viaja en cookie
  `httpOnly` (permite validar en middleware) o se maneja solo en el cliente. No asumir
  una opción sin confirmarlo — impacta directamente cómo se implementa el guard.

### Plantillas de mail (RF-21) — nuevo en v3

- La empresa puede contactar a un postulante (avanza/rechazado) mediante una plantilla
  predefinida, disparada como link `mailto:` — **no** es envío automático de mails desde
  el backend.
- Vive dentro de `features/postulaciones/` (se dispara desde la gestión de postulantes).
  Si el equipo prefiere aislarlo, evaluar un dominio `features/mensajeria/` — no crear
  esa carpeta hasta que se confirme el alcance real (ver sección de pendientes).

### Estructura de carpetas

```
src/
├── app/                     # rutas (App Router) — casi sin lógica de negocio
│   ├── (auth)/{login,registro}/
│   ├── (alumno)/{feed,perfil,postulaciones}/
│   ├── (empresa)/puestos/[id]/postulantes/
│   └── (admin)/moderacion/
├── components/
│   ├── ui/                  # shadcn — no editar a mano, se regenera vía CLI
│   └── layout/               # navbar, sidebar, shells compartidos entre roles
├── features/<dominio>/
│   ├── components/
│   └── hooks/
├── lib/
│   ├── api-client.ts         # wrapper de fetch hacia la API de Spring Boot
│   └── auth.ts
└── types/
```

## Reglas para el agente

**Siempre:**
- Antes de crear un componente nuevo, revisar si ya existe algo similar en `features/`
  o en `components/`.
- Todo fetch a la API pasa por `lib/api-client.ts` — nunca `fetch()` suelto dentro de
  un componente.
- Formularios con React Hook Form + Zod, no manejo de estado de formulario a mano.
- El código de un dominio (`puestos`, `postulaciones`, etc.) vive en
  `features/<dominio>/`, no directamente en `components/`.
- **Todo componente debe ser responsive (mobile + desktop) y funcionar en Chrome, Edge
  y Safari** — a partir de v3 es un requisito obligatorio, no opcional. No asumir
  layouts fijos de escritorio.
- Nunca commitear credenciales, tokens o archivos `.env` — usar variables de entorno.
- Commits pequeños y descriptivos, trabajo en branches con Pull Request y code review
  (regla del equipo, no solo de este archivo).

**Nunca:**
- No agregar Server Components que hagan fetch de datos de negocio sin discutirlo
  antes — rompe el criterio de "CSR por defecto" de arriba.
- No instalar otra librería de componentes sin confirmar — shadcn/ui es la base.
- No modificar `components/ui/` a mano — se regenera vía CLI de shadcn.
- No introducir carpetas de organización tipo `atoms/molecules/organisms`.
- No implementar envío automático de mails/push (backend o frontend) — solo el flujo
  `mailto:` de RF-21 está confirmado en alcance.
- No asumir los nombres exactos de los estados de una postulación (`avanza` vs
  `aceptado`) sin confirmarlos primero — ver pendientes abajo.

## Pendiente de aclarar (inconsistencias del documento de requerimientos v3)

El documento v3 tiene puntos que se contradicen entre secciones. No resolver por
cuenta propia — confirmar con el equipo/docente antes de construir sobre alguno de
estos supuestos:

- **Estado de postulación**: RF-20 y el flujo 6.3 usan "avanza", pero la sección de
  modelo de datos todavía dice "aceptado". Confirmar el valor real antes de tipar el
  enum en el frontend.
- **Formato de import de LinkedIn**: RF-05 dice ZIP/CSV/PDF/txt, el flujo 6.2 dice
  PDF/DOCX. Confirmar qué formatos soporta realmente el backend.
- **Notificaciones**: la sección 3.1 las incluye dentro del alcance, la 3.2 las excluye
  explícitamente. Se asume que se resuelve vía `mailto:` (RF-21) y no envío automático
  real — confirmar antes de dar por cerrado el alcance.
- **Orden del feed por "coincidencia" (RF-14)**: podría interpretarse como un motor de
  matching, lo cual choca con "fuera de alcance: recomendación con IA/ML" (3.2).
  Confirmar si es un ordenamiento simple por reglas (ej. carrera/skills en común) o si
  hay que sacarlo del MVP.
- **Import de LinkedIn bajó de prioridad Alta a Baja** (RF-05/06/07) — no es bloqueante
  para el MVP, se puede construir sobre el final del sprint.

## Fuera de alcance del proyecto

Según el documento de requerimientos (v3): integración en vivo con la API de LinkedIn,
video-CV, interfaz tipo "Tinder del empleo", chat en tiempo real, motor de
recomendación con IA/ML/ranking automático de candidatos, envío automático de
notificaciones push o por correo (más allá del `mailto:` de RF-21),
pagos/suscripciones, testing automatizado, CI/CD y despliegue en la nube.


# Estructura del proyecto

Stack: Next.js 16 (App Router) + React 19 + TypeScript + Tailwind v4.
No hay `src/`: la raíz del repo **es** el src. El alias `@/*` apunta a la raíz (`./*`).

```
app/                        # Rutas y UI (App Router)
├── (auth)/{login,registro}/
├── (alumno)/{feed,perfil,postulaciones}/
├── (empresa)/puestos/[id]/postulantes/
├── (admin)/moderacion/
├── layout.tsx              # Layout raíz: <html>/<body>, estilos y providers globales
└── page.tsx                # Home (/)
components/
└── layout/                 # Navbar, sidebar, shells — compartidos entre roles
features/<dominio>/         # auth, perfil, puestos, postulaciones, moderacion
├── components/             # Componentes propios del dominio
├── hooks/                  # Hooks de datos/estado del dominio
└── types.ts                # Tipos del dominio
lib/
├── api-client.ts           # Cliente HTTP central: base URL, headers, token, errores
└── auth.ts                 # Sesión, token, usuario actual, guards de rol
types/
└── index.ts                # Tipos globales (User, Rol)
```

## Qué va en cada lado

- **`app/`** — solo routing y composición de pantalla. Una carpeta = un segmento de URL;
  la ruta existe recién cuando la carpeta tiene un `page.tsx`. Las páginas deben ser
  delgadas: importan de `features/` y componen. No poner acá lógica de dominio ni fetching.
- **`(paréntesis)`** — route groups: agrupan por rol sin agregar segmento a la URL.
  `app/(alumno)/feed/` sirve `/feed`, no `/alumno/feed`. Cada grupo puede tener su propio
  `layout.tsx` para navbar/sidebar de ese rol.
- **`[corchetes]`** — segmento dinámico (`/puestos/123/postulantes`).
- **`components/layout/`** — UI compartida entre roles, sin lógica de dominio.
- **`components/ui/`** — NO crear a mano: la genera `shadcn@latest init`.
- **`features/<dominio>/`** — todo lo propio de un dominio (componentes, hooks, tipos).
  Es el default: ante la duda, va acá y no en `app/` ni en `components/`.
- **`lib/`** — infraestructura transversal, sin UI.
- **`types/index.ts`** — tipos usados por más de un dominio. Los específicos van en
  `features/<x>/types.ts`.

## Reglas

- Todo el fetching pasa por `lib/api-client.ts`. No usar `fetch` suelto en componentes.
- Los imports usan el alias `@/` (`@/features/puestos/types`), no rutas relativas largas.
- Un dominio no importa desde `features/` de otro dominio. Si algo se comparte, sube a
  `components/`, `lib/` o `types/`.

## Convención de trabajo en equipo

- Una pantalla = una carpeta de ruta; quien la toma es dueño de ese `page.tsx`.
- La lógica va en `features/<x>/`, no en la carpeta de ruta: así dos personas en dominios
  distintos casi no tocan los mismos archivos.
- `components/layout/`, `lib/` y `types/index.ts` son puntos de conflicto: coordinar antes
  de tocarlos.

## Estado actual

Estructura scaffolded con stubs. Pendiente y aún sin definir:

- Backend/API: no definido → `lib/api-client.ts` y `lib/auth.ts` son stubs vacíos.
- `shadcn init`: todavía no se corrió → no existe `components/ui/` ni el theming.
- Las `page.tsx` de cada ruta son placeholders.
