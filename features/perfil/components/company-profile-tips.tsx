import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CheckCircle2Icon } from "lucide-react";

const TIPS = [
  "Completá tu perfil para generar más confianza.",
  "Una buena descripción ayuda a atraer mejores candidatos.",
  "Mantener la información actualizada refleja profesionalismo.",
  "Las empresas con perfil completo reciben más postulaciones.",
];

export function CompanyProfileTips() {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Consejos</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col gap-3 text-sm">
            {TIPS.map((tip) => (
              <li key={tip} className="flex items-start gap-2">
                <CheckCircle2Icon className="mt-0.5 size-4 shrink-0 text-primary" />
                <span className="text-muted-foreground">{tip}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </>
  );
}