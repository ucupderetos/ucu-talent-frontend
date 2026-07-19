import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CheckCircle2Icon, MailIcon } from "lucide-react";

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

      <Card className="bg-muted/40">
        <CardContent className="flex items-center gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <MailIcon className="size-4" />
          </div>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">¿Necesitás ayuda?</span>{" "}
            Si tenés dudas sobre cómo completar tu perfil, escribinos a{" "}
            <a href="mailto:empresas@ucu.edu.uy" className="text-primary underline underline-offset-2">
              empresas@ucu.edu.uy
            </a>
          </p>
        </CardContent>
      </Card>
    </>
  );
}