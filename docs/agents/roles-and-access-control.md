# Roles y control de acceso (RF-AUT-05, RBAC)

> Parte de [AGENTS.md](../../AGENTS.md) — ver el índice ahí para el resto de los documentos.

- 3 roles: **`ALUMNO`**, **`EMPRESA`**, **`ADMIN`**. Cada uno ve solo lo que le
  corresponde.
- **El estado de aprobación vive canónicamente en `User`.** Un único
  `AccountStatus: enum(PENDIENTE, APROBADO, RECHAZADO)` para los tres roles, y **llega en
  `GET /me`**. Esto reemplaza a los dos enums separados que había antes
  (`CompanyStatus` / `StudentProfileStatus`) y también al booleano `Company.approved` del
  MER viejo. ✅ Confirmado en `docs/ENDPOINTS.md`: `StudentProfileResponse` y
  `CompanyResponse` **también** traen `status`/`reviewedAt`/`adminComment` — el mismo valor
  duplicado en el perfil, para que la pantalla de perfil no necesite un segundo fetch a
  `/user/{id}` solo para mostrarlo. La fuente de verdad sigue siendo `User.status`.
- **Toda cuenta nace `PENDIENTE`** (alumno y empresa). No hay aprobación automática: la
  vía `@ucu.edu.uy` que preveía el SRS (RF-AUT-01, RN-01) **se descartó**. Todo alumno se
  registra igual, con documento, y queda `PENDIENTE` hasta que un **Admin lo apruebe a
  mano** contra el padrón (`UniversityRegistry`) → `APROBADO` o `RECHAZADO`, vía
  `PATCH /user/{id}`. ✅ **Confirmado directo contra el código fuente del backend**
  (`UserServiceImpl.create`, rama `dev`): los dos branches de rol (`ALUMNO`/`EMPRESA`)
  setean `AccountStatus.PENDIENTE` — es efectivamente un `if`/`else` sin diferencia. Esto
  es más fuerte que "confirmado de palabra": el `ENDPOINTS.md` propio del repo de backend
  (`ucu-talent-backend/docs/ENDPOINTS.md`) dice lo contrario — "`ALUMNO` nace `APROBADO`,
  `EMPRESA` nace `PENDIENTE`" — pero esa afirmación **no coincide con su propio código**,
  así que se descarta como error de esa doc, no como cambio de comportamiento (ver
  [Las tres fuentes y su orden de precedencia](sources-and-precedence.md)). Una vez
  `APROBADO`/`RECHAZADO`, el Admin puede alternar libremente entre esos dos
  (`PATCH /user/{id}` es reversible en ese sentido: puede pasar de `RECHAZADO` a
  `APROBADO` más tarde, y viceversa) — lo único que `UserServiceImpl.updateStatus` bloquea
  con `409` es volver a `PENDIENTE`.
- **El estado no restringe el acceso, restringe la acción.** Es el mismo criterio para
  los dos roles:
  - Alumno `PENDIENTE` o `RECHAZADO`: entra, arma su perfil, navega el feed y ve el
    detalle de los puestos. **No puede postularse** (RN-16, RF-AUT-06).
  - Empresa `PENDIENTE` o `RECHAZADA`: entra y gestiona su ficha. **No puede publicar
    puestos** (RN-02, RF-MOD-04). El gate es sobre la empresa, no sobre cada puesto.
  - En ambos casos la UI muestra el estado de forma permanente y, si el Admin lo
    registró, el motivo.
- Los `layout.tsx` de `(alumno)` y `(empresa)` validan **rol**, no estado. El estado se
  chequea en el punto de acción (el botón de postularse, el de publicar), porque bloquear
  la ruta entera contradiría RN-16 y RN-02.
- Vacante (`Vacancy`): **post-moderación (DEC-01)** — nace ya `PUBLICADO` **por default**
  al crearse, sin aprobación previa por puesto (RN-03). Estados **confirmados**:
  `enum(PENDIENTE, PUBLICADO, FINALIZADO)` — **sin `RECHAZADO`** (se descartó) **ni
  `paused`**. ✅ **Confirmado contra el código fuente del backend** (`vacancy/VacancyStatus.java`),
  con dos endpoints separados por actor: `PATCH /vacancy/status/{id}` (EMPRESA + dueña) y
  `PUT /vacancy/status/{id}` (ADMIN, `UpdateVacancyStatusAdminRequest`). Las transiciones
  NO son simétricas por rol:
  - **La empresa dueña SOLO cierra desde `PUBLICADO`** — `PUBLICADO → FINALIZADO`
    (terminal, RF-PUE-03). ⚠️ **NO puede cerrar desde `PENDIENTE`** — corrige una versión
    anterior de este párrafo (y de una nota más abajo, en [Estado actual del
    repo](repo-status.md)) que decía que sí podía, apoyada en el `ENDPOINTS.md` del propio
    repo de backend. El código fuente real (`VacancyServiceImpl.updateVacancyStatus`, rama
    `dev`) lo prohíbe explícitamente: `if (existing.getStatus() == PENDIENTE) throw new
    ForbiddenOperationException("El Puesto está en revisión.")` — un `403`, no un `409`.
    Mientras el Admin la tiene en revisión, la empresa no puede tocarla. `vacancy-table.tsx`
    ya estaba bien (el botón "Cerrar" solo sale para `PUBLICADO`); era la doc la que estaba
    mal.
  - **El Admin SOLO mueve `PUBLICADO ↔ PENDIENTE`** — nunca a `FINALIZADO`, aunque esto es
    **política, no algo que el código fuerce**: `updateVacancyStatusAdmin` acepta cualquier
    `VacancyStatus` en el body salvo que la vacante YA esté `FINALIZADO` — no hay un chequeo
    explícito que impida mandar `status: FINALIZADO`. El front nunca ofrece esa opción en la
    UI de Admin, así que no es un problema práctico, pero no depender de que el backend lo
    vaya a rechazar solo. "Dar de baja" para el Admin es `PUBLICADO → PENDIENTE` (se
    conservan las postulaciones, no hay baja física) — eso sigue confirmado.

  Impacto: el panel de admin es una **bandeja de revisión de lo ya publicado** (últimas
  24h destacadas — RF-MOD-01), no una cola de aprobación previa ni una que pueda cerrar
  vacantes. La empresa ve su vacante viva apenas la crea.

  ⚠️ **`closingDate` es obligatoria al crear y dispara un cierre automático.** No estaba
  documentada en ninguna versión de `ENDPOINTS.md` (ni la local ni la del backend) hasta
  que se verificó contra el código fuente: `CreateVacancyRequest.closingDate` es
  `@NotNull`, y un cron diario en el backend
  (`VacancyServiceImpl.finalizeExpiredVacancies`, 00:00 America/Montevideo) pasa a
  `FINALIZADO` toda vacante `PUBLICADO` cuya `closingDate` ya pasó, y dispara el mail de
  cierre a cada postulante — sin que la empresa haga nada. `publicationDate` también es
  obligatoria al crear (no la autogenera el backend al aprobar/publicar); el back valida
  que no sea anterior a hoy, que `closingDate` no sea anterior a `publicationDate`, y que
  no pase más de un año entre las dos. El form de "Publicar oferta" (`job-basic-info-form.tsx`)
  ya pide las dos fechas.
- Cada route group (`(auth)`, `(alumno)`, `(empresa)`, `(admin)`) lleva su propio
  `layout.tsx` que valida el rol antes de renderizar. Ya existen: son de 3 líneas y
  delegan en `RoleGuard` (`features/auth/components/role-guard.tsx`).

## Registro en dos pasos y `ProfileGuard`

**El registro son tres llamadas encadenadas**, y el orden no es negociable: `POST /user`
devuelve `201` pero **no** setea cookie, y `POST /student-profile` exige sesión
(`🔒 rol ALUMNO`). Así que hay que loguearse en el medio:

```
POST /user            → 201   (email, password, role)
POST /auth/login      → 200   + Set-Cookie httpOnly   ← obligatorio, no es opcional
POST /student-profile → 201   (o POST /company, según el rol)
```

**Los datos mínimos del paso 2 son obligatorios para los dos roles.** Son exactamente los
campos `@NotBlank` que ya exige `ENDPOINTS.md` — ni uno más:

| Rol | Campos del paso 2 |
|---|---|
| `ALUMNO` | `name`, `surname`, `documentType`, `documentNumber` |
| `EMPRESA` | `name` (razón social), `industry`, `description`, `webUrl`, `linkedinUrl`, `location` |

Todo lo demás (teléfono, LinkedIn del alumno, skills, descripción, foto) es opcional y se
completa después desde `/perfil`.

**El documento del alumno son dos campos, no uno.** `documentType` es un `Select`
(`CEDULA_IDENTIDAD` / `PASAPORTE` / `DNI` — labels en español, default
`CEDULA_IDENTIDAD`) y `documentNumber` un input de texto libre. El número **se valida de
formato en el front, según el tipo elegido** (ver A-10 en [Pendiente de
aclarar](open-questions.md)): cédula/DNI solo dígitos, exactamente 8; pasaporte
alfanumérico 6–9. La validez real (dígito verificador, padrón) la hace el backend — el
front solo chequea superficie y **bloquea el avance** con un mensaje inline genérico
("Ingresá un número de documento válido.") igual que la contraseña. El backend limpia
separadores (puntos, comas) antes de guardar, así que el número puede tipearse con o sin
ellos; la lógica pura vive en `lib/validators.ts`
(`cleanDocumentNumber`/`isValidDocumentNumber`), compartida por `register-form.tsx` y
`complete-profile-form.tsx` (los dos formularios montan el mismo paso 2).

**Se implementa en dos capas, y hacen falta las dos:**

1. **El wizard** — `/registro` es un formulario multi-paso en una sola pantalla, sin
   navegación entre medio. Es el camino feliz y cubre el 95% de los casos.
2. **`ProfileGuard`** — la red que atrapa al que cerró la pestaña entre el paso 1 y el 2.
   Esa cuenta queda huérfana (existe en `User`, sin perfil) y **puede loguearse igual**,
   porque `POST /auth/login` solo mira `User`. Sin el guard, ese usuario entra a la app sin
   `studentProfileId` y revienta la mitad de las pantallas.

`ProfileGuard` vive en `features/perfil/components/`, y lo montan **`(alumno)/layout.tsx`
y `(empresa)/layout.tsx`** — no `(admin)`. La asimetría por rol sale gratis de los route
groups: no hace falta un solo `if (role === ...)`.

```tsx
// app/(alumno)/layout.tsx
<RoleGuard role="ALUMNO">
  <ProfileGuard>{children}</ProfileGuard>
</RoleGuard>
```

Dos detalles que **no se pueden resolver de otra forma**:

- **`/completar-perfil` va FUERA de los route groups.** Si estuviera dentro de `(alumno)`,
  el guard la redirigiría a sí misma en loop infinito. Lleva su propio chequeo de rol y
  renderiza el mismo paso 2 del wizard.
- **Un guard de servidor no sirve para esto.** Solo podría leer la cookie; no sabe si hay
  perfil. `ProfileGuard` es client-side, sí o sí. (Y encima ese guard ya no existe — ver
  abajo.)

## ⚠️ En Next 16 `middleware.ts` ya no existe: ahora es `proxy.ts` — pero acá no usamos ninguno

Next 16 renombró Middleware a **Proxy**. La funcionalidad es la misma, pero **el archivo
tiene que llamarse `proxy.ts`** (en la raíz, al mismo nivel que `app/`) y exportar una
función `proxy`. Un `middleware.ts` **no se ejecuta nunca** — o sea que un guard escrito
ahí no protege nada y falla en silencio. Ver `node_modules/next/dist/docs/01-app/
01-getting-started/16-proxy.md`.

⛔ **Dicho eso: este proyecto NO tiene `proxy.ts`, y no debe volver a tenerlo.** Se borró
el 2026-07-30 porque rompía el login con un loop de redirección — el server del frontend
no puede leer la cookie de sesión, que vive en el dominio de la API. El detalle completo
está en "El acceso se valida en tres capas" (más abajo, en este mismo documento). Esta
sección queda porque el dato de Next 16 sigue siendo cierto y útil (si alguien crea un
`middleware.ts`, falla en silencio), no porque haya que crear el archivo.

## El acceso se valida en tres capas, y solo una es seguridad

| Capa | Qué hace | ¿Es seguridad? |
|---|---|---|
| ~~`proxy.ts`~~ | ⛔ **NO EXISTE** — se borró: no puede funcionar cross-domain, ver abajo | ❌ No |
| `layout.tsx` del route group (`RoleGuard`) | Guard de rol para UX: evita ver pantallas ajenas | ❌ No |
| **Spring Boot** | **Autorización real** | ✅ **Sí** |

Las dos primeras son UX: cualquiera las saltea con las devtools. **El backend tiene que
rechazar toda request que no corresponda, sin importar lo que haga el frontend.**

⛔ **`proxy.ts` se borró el 2026-07-30 — no volver a crearlo** (ni como `proxy.ts` ni
como `middleware.ts`). El guard optimista es **imposible** en esta arquitectura, y no es
un bug que se pueda arreglar: la cookie `access_token` la setea el backend desde
`api-dev.ucutalent.tech`, así que el browser solo la manda a ESE dominio. El frontend
corre en `dev.ucutalent.tech` (y `localhost:3000` en local), y `proxy.ts` se ejecuta en el
server del frontend, donde `request.cookies` **nunca** va a tener `access_token`, esté
logueado el usuario o no.

Con el guard activo había un **loop de redirección infinito** que rompía el login para
todo usuario ya logueado: `/login` → `GuestOnly` ve sesión válida (pregunta `GET /me`
cross-origin, ahí la cookie SÍ viaja) → redirige a la home del rol → `proxy.ts` no ve
cookie → vuelve a `/login` → repetir. Síntoma: `/login` con el panel de marca y el lado
derecho vacío, aparentando que "nunca redirige". Solo se salvaba quien no tenía sesión
(incógnito). Verificado contra `https://dev.ucutalent.tech` con sesión ADMIN real:
`GET /me` → `200` y `GET /admin/{id}` → `200`, pero `/moderacion/dashboard` rebotaba a
`/login` igual.

No se pierde seguridad (nunca fue seguridad) ni el redirect: `RoleGuard` (client-side) ya
lo hace, y sí puede preguntar `GET /me` cross-origin. Lo único que se pierde son unos ms.
Si alguien quiere recuperar la optimización, la única vía viable es que el **frontend**
setee su propia cookie NO httpOnly de "hay sesión" en su propio dominio al loguearse (y la
limpie al salir) — un flag de UX, nunca el token. Es decisión de equipo.

⚠️ **Efecto colateral relacionado, distinto del loop**: desde `localhost:3000` el
`GET /me` da `401` aunque haya sesión, porque contra `api-dev.ucutalent.tech` la cookie es
**third-party** y Chrome la bloquea. Desde `dev.ucutalent.tech` no pasa: los dos comparten
el dominio registrable `ucutalent.tech`, así que es same-site. O sea que **probar el login
en local no representa lo que ve el usuario deployado** — otra razón para verificar
siempre también contra `https://dev.ucutalent.tech`.

El doc de Next es explícito: Proxy *"no está pensado como solución completa de manejo de
sesión ni de autorización"*. Corre en cada request, incluidas las prefetcheadas, así que
solo puede **leer la cookie** — nunca pegarle a la base ni a la API.

## Auth: cookie `httpOnly` — ✅ confirmado

Ya no es una asunción: `ENDPOINTS.md` lo define.

- `POST /auth/login` devuelve `200` + **`Set-Cookie` httpOnly** con el JWT.
  `POST /auth/logout` la vence. Ambos son públicos.
- **Consecuencia forzosa: el cliente no puede leer el token ni el rol.** La única forma
  de saber quién es el usuario es preguntándoselo al backend.
- **`GET /me`** (`🔒 Autenticado`) devuelve `MeResponse`:
  ```ts
  { userId, email, role: Role, status: AccountStatus, registeredAt, hasProfile: boolean }
  ```
  El `status` se lee fresco de la BD en cada llamada, nunca del JWT — así una aprobación
  del Admin se refleja sin reloguear. `hasProfile` ✅ ya es un campo real del wire (antes
  A-09 lo daba como "confirmado, todavía no en api-dev"; `docs/ENDPOINTS.md` lo cierra) —
  `hooks/use-session.ts` hoy lo *deriva* del 404 al perfil en vez de leerlo
  directo; no es incorrecto (mismo resultado), pero es candidato a simplificarse una vez
  que se confirme el campo en `api-dev`. Lo consume una sola vez para toda la app (Query
  deduplica por `queryKey`).
- **`MeResponse` NO trae `name`.** El navbar necesita el nombre, así que hoy hace falta un
  segundo fetch al perfil según el rol (`GET /student-profile?userId={id}` o
  `GET /company?userId={id}`). Está pedido como cambio a backend — ver
  [Pendiente de aclarar](open-questions.md).
- **PK compartida**: `studentProfileId === userId` y `companyId === userId`. No hace falta
  guardar un id de perfil aparte ni resolverlo con una llamada extra.
- `lib/api-client.ts` manda `credentials: "include"` para que el browser adjunte la cookie
  en cross-origin.

⚠️ **`POST /auth/login` tiene rate limit — no documentado en ninguna versión de
`ENDPOINTS.md`, verificado contra el código fuente del backend.** Doble límite en memoria:
5 intentos/60s por email, 20 intentos/60s por IP. Al excederse devuelve `429 Too Many
Requests` (`application/problem+json`, header `Retry-After` con los segundos de bloqueo) y
escala progresivamente si la misma key reincide (30s → 3min → 15min, se resetea solo tras
24h sin infracciones). `login-form.tsx` hoy no distingue `429` de otros errores — si
`api-client.ts` ya expone bien el `detail`/`Retry-After` (ver A-19 en [Pendiente de
aclarar](open-questions.md)), es un buen próximo paso mostrar el tiempo de espera en vez
del mensaje genérico de error de login.
