# Fuera de alcance del proyecto

> Parte de [AGENTS.md](../../AGENTS.md) — ver el índice ahí para el resto de los documentos.

Según el SRS v2.1: integración en vivo con la API de LinkedIn, video-CV, interfaz tipo
"Tinder del empleo", chat en tiempo real, motor de recomendación con IA/ML/ranking
automático de candidatos, notificaciones in-app y push, pagos/suscripciones/pasarela de
pagos, recuperación de contraseña por correo (identificada como evolución posterior al
MVP), ABM del padrón en la interfaz, testing automatizado, CI/CD y despliegue en la nube.

Además, **descartado por decisión posterior al SRS**:

- **`MailTemplate`, RF-PUE-05 y RF-POS-04** — no hay ABM de templates ni `mailto:`. El
  contacto empresa → alumno ocurre enteramente fuera del sistema. Ver [Mails](mails.md).
- **La vía de registro por `@ucu.edu.uy`** (RF-AUT-01, RN-01a) — no hay aprobación
  automática por dominio de correo. Toda cuenta nace `PENDIENTE`.
- **`VacancyApplicationStatus` con `ACEPTADO`/`RECHAZADO`** — es `PENDIENTE, VISTO, FINALIZADO`.
  El flag de resultado sí existe (se llama `accepted`, no `selected` — ver
  [Postulaciones](applications-state-machine.md)), pero no es un tercer valor del enum de
  estado: es un campo booleano aparte.

Los correos automáticos son **dos** y los manda el backend: aviso de nueva postulación a
la empresa, y aviso de cierre a cada postulante al finalizar el puesto. El frontend no
manda ninguno. Ningún otro evento dispara un envío.
