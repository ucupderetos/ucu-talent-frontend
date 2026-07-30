# Las tres fuentes y su orden de precedencia

> Parte de [AGENTS.md](../../AGENTS.md) — ver el índice ahí para el resto de los documentos.

Este documento se sincroniza contra tres artefactos externos que **no siempre coinciden
entre sí**. Cuando se contradicen, gana el de más abajo:

| # | Fuente | Qué es | Cuándo gana |
|---|---|---|---|
| 1 | **SRS v2.1** (`UCU_Talent_SRS_v2.docx`) | Requerimientos (RF-AUT, RF-PER, RF-PUE, RF-MOD, RF-FEED, RF-POS), reglas de negocio (RN) y decisiones (DEC) | Reglas de negocio y comportamiento de UI |
| 2 | **MER** (`plantuml_export.puml`) | Modelo de datos aprobado | Forma de las entidades. **Es posterior al SRS** y ya lo revierte en varios puntos |
| 3 | **`ENDPOINTS.md`** | Lo que el backend expone **hoy** | Contrato real: paths, schemas, enums, permisos |

En la práctica: el SRS dice *qué* tiene que pasar, el MER dice *cómo se modela*, y
`ENDPOINTS.md` dice *contra qué podemos programar ahora mismo*. Si `ENDPOINTS.md` todavía
no tiene algo que el SRS pide, se documenta como pendiente y **no se implementa** hasta
que exista — no se inventa el endpoint.

⚠️ El MER es más nuevo que el SRS y **revierte** parte de él: elimina `MailTemplate`,
saca los datos personales de `User`, agrega la entidad `Admin`, agrega
`Vacancy_Application.selected` y agrega un segundo correo automático. Esos puntos del SRS
están desactualizados y se van a corregir en una revisión posterior del documento.

⚠️ **A su vez, `docs/ENDPOINTS.md` (fuente #3, recibido 2026-07-27) parecía revertir uno de
esos puntos del MER**: `selected` no aparecía en ningún lado de esa primera versión del
contrato. Eso se dio por definitivo un tiempo — hasta verificar contra la fuente #4 de
abajo, que lo revierte otra vez: el campo existe, solo que con otro nombre. Ver
[Postulaciones: máquina de estados](applications-state-machine.md).

## Fuente #4 (2026-07-28): el código fuente del backend le gana a su propio `ENDPOINTS.md`

El repo de backend (`ucupderetos/ucu-talent-backend`) tiene **su propio `docs/ENDPOINTS.md`**,
más detallado que la copia local de este repo (`docs/ENDPOINTS.md`, fuente #3) — y las dos
copias **no siempre coinciden entre sí**, y ninguna de las dos coincide siempre con el
código real. Verificado leyendo los DTOs/entidades/servicios del backend directo (`gh api`
contra `ucupderetos/ucu-talent-backend`, rama `dev`) en vez de confiar en cualquiera de los
dos markdown:

- El `ENDPOINTS.md` del backend afirma que `ALUMNO` nace `APROBADO` y `EMPRESA` nace
  `PENDIENTE` — **falso contra su propio código** (`UserServiceImpl.create`: los dos branches
  de rol asignan `PENDIENTE`, sin diferencia real). La copia local de este repo tenía razón.
- El `ENDPOINTS.md` del backend no documentaba que la empresa dueña **no puede** cerrar una
  vacante `PENDIENTE` (solo desde `PUBLICADO`) — confirmado contra `VacancyServiceImpl.
  updateVacancyStatus`, que lo prohíbe con `403`.
- Ninguna de las dos copias de `ENDPOINTS.md` documentaba `Vacancy.publicationDate`/
  `closingDate` (obligatorias al crear, no autogeneradas), que `salary`/`salaryRange` son
  nombres DISTINTOS según el endpoint (`CreateVacancyRequest` vs. `UpdateVacancyRequest`),
  que `contractType` es un enum real (`ContractType.java`), ni el cron de auto-cierre por
  `closingDate`.
- Ninguna de las dos documentaba que `accepted` (ex-`selected` del MER) sí existe en
  `VacancyApplicationResponse`, ni el endpoint dedicado para marcarlo
  (`PATCH /vacancy-application/{id}/accept`).
- `CreateVacancyApplicationRequest.studentProfileId` es `@NotBlank` en el DTO real, aunque
  el controller lo pise con el del token — mandar solo `{ vacancyId }` (lo que indicaban las
  dos copias de `ENDPOINTS.md`) hace fallar la request con `400`.

**Regla práctica desde acá**: cuando se pueda, verificar contra el código fuente del
backend (los DTOs/records y los `*ServiceImpl` son los más confiables — las anotaciones
`@Schema`/`@Operation` de Swagger a veces también mienten) en vez de confiar ciegamente en
cualquiera de los dos `ENDPOINTS.md`. Cuando el código fuente no está a mano, la copia
local de `docs/ENDPOINTS.md` (fuente #3) sigue siendo el mejor default — pero un aviso de
"ya está arreglado" o "así lo tenemos documentado" de backend no reemplaza probarlo (ver
también el caso de CORS en [Estado actual del repo](repo-status.md) — "El backend ya está
levantado").
