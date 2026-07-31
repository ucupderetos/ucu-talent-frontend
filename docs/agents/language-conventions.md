# Idioma del código

> Parte de [AGENTS.md](../../AGENTS.md) — ver el índice ahí para el resto de los documentos.

Confirmado por el equipo:

| Qué | Idioma |
|---|---|
| **Identificadores** (tipos, funciones, variables, props) | **Inglés**, espejando el MER |
| **Valores de enum** | **Español y en MAYÚSCULA**, tal como los manda el backend |
| **Comentarios y documentación** | Español |
| **URLs y texto de UI** | Español (son cara al usuario: `/feed`, `/perfil`, "Mis postulaciones") |
| **Ramas y commits** | Inglés |

Los **nombres** de tipos y campos espejan el MER en inglés: `Vacancy` (no "Puesto"),
`status` (no "estado"), `StudentProfile.documentNumber`.

Los **valores** de los enums van en español y en mayúscula, exactamente como llegan de la
API — **no se traducen ni se mapean**:

```ts
type Role = "ALUMNO" | "EMPRESA" | "ADMIN";           // no "student" | "company" | "admin"
type AccountStatus = "PENDIENTE" | "APROBADO" | "RECHAZADO";
type VacancyStatus = "PENDIENTE" | "PUBLICADO" | "FINALIZADO";
type Modality = "PRESENCIAL" | "HIBRIDO" | "REMOTO";
type DocumentType = "CEDULA_IDENTIDAD" | "DNI" | "PASAPORTE";
```

El criterio: un mapeo entre `"student"` y `"ALUMNO"` es una capa de traducción que hay que
mantener sincronizada en los tres grupos y que solo produce bugs. Se paga el costo de la
inconsistencia estética una vez, en este párrafo. Para mostrarle el valor al usuario se usa
un diccionario de presentación en el componente, no un cambio del tipo.

⚠️ Las carpetas de `features/` siguen en español (`puestos`, `postulaciones`, `perfil`,
`moderacion`) — renombrarlas es una decisión aparte que el equipo todavía no tomó.
