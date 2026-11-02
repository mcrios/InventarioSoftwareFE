"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
  }

  if (sent) {
    return (
      <AuthCard
        title="Revisa tu correo"
        subtitle="Enviamos un enlace de recuperación a la dirección indicada."
        footer={
          <Link
            href="/login"
            className="font-title-md text-primary-container hover:underline"
          >
            Volver al inicio de sesión
          </Link>
        }
      >
        <div className="flex flex-col items-center gap-4 rounded-2xl bg-surface-container-low p-6 text-center shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container">
            <Icon name="mark_email_read" className="text-[30px]" filled />
          </div>
          <div>
            <p className="font-title-md text-title-md text-on-surface">
              Enlace enviado a
            </p>
            <p className="font-code-md text-code-md text-primary-container">
              {email}
            </p>
          </div>
          <p className="font-body-sm text-body-sm text-secondary">
            El enlace expira en 30 minutos. Si no lo recibes, revisa la carpeta
            de spam o solicita uno nuevo.
          </p>
          <Button
            variant="secondary"
            onClick={() => setSent(false)}
            className="rounded-xl"
          >
            <Icon name="restart_alt" className="text-[18px]" />
            <span>Enviar de nuevo</span>
          </Button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Recupera tu acceso"
      subtitle="Ingresa tu correo corporativo y te enviaremos un enlace para restablecer la contraseña."
      footer={
        <>
          ¿Recordaste tu contraseña?{" "}
          <Link
            href="/login"
            className="font-title-md text-primary-container hover:underline"
          >
            Inicia sesión
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Correo corporativo"
          name="email"
          type="email"
          icon="mail"
          autoComplete="email"
          placeholder="tu.nombre@empresa.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          hint="Usa el correo asociado a tu cuenta de OpsCore."
          required
        />

        <Button type="submit" className="w-full rounded-xl py-2.5">
          <span>Enviar enlace de recuperación</span>
          <Icon name="send" className="text-[18px]" />
        </Button>
      </form>
    </AuthCard>
  );
}
