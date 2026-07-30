# Nomenclatura de ramas y commits

> Parte de [AGENTS.md](../../AGENTS.md) — ver el índice ahí para el resto de los documentos.

Fuente: *Guía de Nomenclatura del Proyecto*. Ramas y commits van **en inglés, en
minúsculas y separando palabras con guiones**.

## Ramas

Se crean **siempre a partir de `dev`**, salvo `hotfix/` que sale de `main`.
Nunca commitear directo a `main` ni a `dev`: siempre rama + Pull Request.

| Prefijo | Para qué | Ejemplo |
|---|---|---|
| `feature/` | Nueva funcionalidad | `feature/sign-in` |
| `bugfix/` | Corregir errores en dev/pruebas | `bugfix/misaligned-text` |
| `hotfix/` | Errores críticos en producción (sale de `main`) | `hotfix/payment-crash` |
| `release/` | Preparar una versión antes de publicarla | `release/v1.0.0` |
| `refactor/` | Reorganizar o mejorar estructura **sin cambiar comportamiento** | `refactor/user-controller` |
| `chore/` | Mantenimiento, configuración, dependencias | `chore/update-dependencies` |
| `docs/` | Cambios exclusivos de documentación | `docs/update-readme` |

Si el cambio **agrega o modifica funcionalidad, va en `feature/`**, no en `refactor/`.

Flujo: `feature/` sale de `dev` y vuelve a `dev` → `release/` sale de `dev` y va a `main`
→ `hotfix/` sale de `main` y vuelve a `main`.

## Commits

Estructura: `tipo(alcance): descripción corta en minúsculas`
El *alcance* es la zona o módulo afectado. **No incluir el ticket en el título** — queda
vinculado a través del nombre de la rama.

| Tipo | Para qué | Ejemplo |
|---|---|---|
| `feat` | Nueva funcionalidad para el usuario | `feat(auth): add google sign in` |
| `fix` | Corrige un error de la aplicación | `fix(payment): fix card processing error` |
| `docs` | Cambios exclusivos de documentación | `docs(readme): update installation steps` |
| `refactor` | Cambios que no añaden funciones ni corrigen errores | `refactor(user): rename confusing variables` |
| `chore` | Mantenimiento, configuración, herramientas | `chore(deps): update axios version` |
