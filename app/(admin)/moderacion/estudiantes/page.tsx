// la pagina solo llama a la vista, todo lo demas esta en features/moderacion

import { StudentsView } from "@/features/moderacion/components/students/students-view";

export default function AdminStudentsPage() {
  return <StudentsView />;
}
