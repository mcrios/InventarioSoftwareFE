import type { Metadata } from "next";
import { ErrorPage } from "@/components/errors/ErrorPage";

export const metadata: Metadata = {
  title: "Acceso denegado",
};

export default function ForbiddenPage() {
  return (
    <ErrorPage
      code="403"
      icon="lock"
      title="Acceso denegado"
      description="Tu cuenta no tiene los permisos necesarios para entrar a esta sección del sistema."
      hint="Solicita al administrador que asigne el acceso correspondiente a tu rol."
    />
  );
}
