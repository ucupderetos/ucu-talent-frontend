# Postulaciones: máquina de estados

> Parte de [AGENTS.md](../../AGENTS.md) — ver el índice ahí para el resto de los documentos.

```
VacancyApplicationStatus: enum(PENDIENTE, VISTO, FINALIZADO)
```

⚠️ **El valor terminal es `FINALIZADO` (masculino), NO `FINALIZADA`.** Varias versiones
anteriores de este archivo (y de `types/index.ts`) insistían en que era femenino "por
postulación", justo para no confundirlo con `VacancyStatus.FINALIZADO` — esa distinción
**no existe en el wire real**: verificado directo contra el enum fuente del backend
(`vacancyapplication/VacancyApplicationStatus.java`), los dos enums usan la misma palabra.
Si algo en el código sigue comparando contra `"FINALIZADA"`, está mal.

| Transición | Disparador | Actor |
|---|---|---|
| (alta) → `PENDIENTE` | el alumno se postula | Alumno |
| `PENDIENTE` → `VISTO` | la empresa abre el perfil del postulante | Empresa dueña |
| `VISTO` → `FINALIZADO` | acción explícita de la empresa (`PUT /vacancy-application/{id}`) | Empresa dueña |

⚠️ **La última transición NO es automática — corrige una versión anterior de esta
tabla**, que decía "automático, en cascada al finalizar el puesto, Sistema". Verificado
contra el código fuente (`VacancyApplicationServiceImpl`/`VacancyServiceImpl`/
`VacancyFinalizationNotifier`): cerrar una vacante (por la empresa, o por el cron de
`closingDate` — ver [Roles y control de acceso](roles-and-access-control.md)) **solo
dispara el mail de cierre a cada postulante**, nunca toca `VacancyApplication.status`. La
única función que cambia el status de una postulación es
`VacancyApplicationServiceImpl.update`, llamada exclusivamente desde
`PUT /vacancy-application/{id}` (empresa dueña, acción explícita) — no hay ningún otro
caller. El frontend todavía no tiene una acción de UI para disparar `VISTO → FINALIZADO`
(ver `use-mark-applicant-viewed.ts`, que solo cubre `PENDIENTE → VISTO`).

- El estado **nunca retrocede** (RN-08). Una transición inválida devuelve `409` y no
  modifica la postulación.
- Un alumno no puede postularse dos veces al mismo puesto: `UNIQUE (vacancy_id,
  student_profile_id)` (RN-05). El segundo intento devuelve `409`.
- **El alumno puede retirar su propia postulación**: `DELETE /vacancy-application/{id}`
  (dueño = el alumno postulante, verificado contra `VacancyApplicationController.delete`).
  No documentado en ninguna versión de `ENDPOINTS.md`; sin UI en el front todavía.
- **Postularse exige que el alumno tenga al menos un registro de `Education`** — resuelve
  A-07 (antes "el backend no lo valida, decisión de front"): sí lo valida, `409` con el
  mensaje "El alumno debe tener al menos un registro de educacion para postularse" si no
  tiene ninguno (`VacancyApplicationServiceImpl.create`). El front no lo pre-valida — el
  mensaje de error real del backend ya lo explica (ver `use-vacancy.ts`).
- **También hace falta que la vacante esté `PUBLICADO`**: postular a una `PENDIENTE`
  devuelve `409` ("Solo se puede postular a vacantes en estado PUBLICADO"). `ApplyAction`
  (`vacancy-detail-view.tsx`) ya bloquea el botón en ese caso.

⚠️ **`accepted` volvió — reversión de una reversión.** El MER aprobado tenía `selected`
(`Vacancy_Application.selected: boolean`, DEC-06); una revisión anterior de esta sección
lo daba por eliminado porque ninguna versión de `docs/ENDPOINTS.md` (ni la local ni la del
backend) lo documentaba. **Verificado contra el código fuente del backend, no contra esa
doc**: el campo existe, se llama `accepted` (no `selected`) y vive en
`VacancyApplicationResponse` — boolean, default `false`, de solo lectura salvo por
`PATCH /vacancy-application/{id}/accept` (empresa dueña, sin operación inversa). Define el
contenido del mail de cierre (`VacancyFinalizationNotifier`: `accepted === true` →
`sendVacancySelectedEmail`, si no → `sendVacancyClosedEmail`) — es decir, el criterio que
esta sección daba como "no definido en `docs/ENDPOINTS.md`" sí está definido, solo que en
el código, no en ese doc. **Sigue sin viajar en `VacancyApplicationStudentResponse`**
(`GET /vacancy-application/me`) — el alumno sigue sin poder ver si quedó seleccionado; la
barra de progreso de "Mis postulaciones"
(`features/postulaciones/components/application-progress.tsx`) sigue sin mostrarlo, y eso
sí sigue siendo correcto. `types/index.ts` (`VacancyApplication.accepted`) ya lo tiene.
