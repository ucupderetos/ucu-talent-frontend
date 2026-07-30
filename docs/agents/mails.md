# Mails: los dos son del backend, el frontend no manda ninguno

> Parte de [AGENTS.md](../../AGENTS.md) — ver el índice ahí para el resto de los documentos.

**El frontend no participa de ningún envío de correo.** No arma `mailto:`, no tiene
templates, no muestra previews. Si aparece código de correo en este repo, está de más.

Los dos correos automáticos del sistema, ambos desde Spring Boot:

1. **Nueva postulación → a la empresa** (RF-POS-01, RN-18). Nombre del puesto, nombre y
   apellido del postulante, fecha, skills coincidentes y un link a la app. El link exige
   login si no hay sesión y luego redirige al destino (DEC-11) — **nunca** un token sin
   autenticación, para no filtrar el perfil de un alumno a quien reenvíe el mail. Envío
   asíncrono: un fallo del proveedor nunca bloquea ni revierte el registro de la
   postulación (RNF-14). `notified_at` da idempotencia.
2. **Cierre del puesto → a cada postulante** (según el MER). Al finalizar la vacante, el
   sistema manda un no-reply por postulante. `result_notified_at` da idempotencia. El MER
   originalmente ataba el contenido del mail a `selected`, pero ese campo se eliminó del
   contrato cerrado (ver [Postulaciones: máquina de estados](applications-state-machine.md))
   — el criterio real para el contenido del mail no está definido en `docs/ENDPOINTS.md`
   hoy.

> ⚠️ **Esto revierte dos cosas que decía antes esta sección.** (a) Que el alumno nunca
> recibía correo automático: ahora sí lo recibe, al cerrarse el puesto. (b) Que la empresa
> contactaba al alumno con un `mailto:` precargado desde sus `MailTemplate`.
>
> **`MailTemplate` se elimina del modelo** y con ella RF-PUE-05 (ABM de templates) y
> RF-POS-04 (`mailto:`). El SRS v2.1 todavía las tiene; el MER las sacó y el MER es
> posterior. **No implementar ninguna de las dos.**
>
> El contacto empresa → alumno pasa a ocurrir **enteramente fuera del sistema**: la empresa
> ve los datos del alumno en su perfil y le escribe por su cuenta. El frontend solo muestra
> el email; no ofrece ninguna acción de contacto.
>
> ⚠️ **Ver A-23 en [Pendiente de aclarar](open-questions.md): el backend SÍ tiene el
> `MailTemplateController` completo y funcionando**, lo que contradice el "se elimina del
> modelo" de este párrafo (basado en el MER, no en el código del backend). Decisión del
> equipo 2026-07-30: mantener esta sección como está (no implementar RF-PUE-05) hasta
> confirmar con backend si es código legacy sin retirar o un cambio de rumbo real — no
> autoimplementarlo solo porque el endpoint responde.
