// Tipos globales compartidos por toda la app.
// Los tipos específicos de cada dominio van en features/<x>/types.ts.

export type Rol = "alumno" | "empresa" | "admin";

export interface User {
  id: string;
  nombre: string;
  email: string;
  rol: Rol;
}
