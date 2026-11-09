import { ErrorPage } from "@/components/errors/ErrorPage";

export default function NotFound() {
  return (
    <ErrorPage
      code="404"
      icon="explore_off"
      title="Página no encontrada"
      description="La dirección que ingresaste no existe o fue movida a otra sección del sistema."
      hint="Revisa la URL o vuelve al panel principal para continuar."
    />
  );
}
