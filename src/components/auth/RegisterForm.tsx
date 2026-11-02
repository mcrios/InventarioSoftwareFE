"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!email.includes("@")) {
      setError("Ingresa un correo corporativo válido.");
      return;
    }

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (!accepted) {
      setError("Debes aceptar los términos y la política de privacidad.");
      return;
    }

    setLoading(true);
    window.setTimeout(() => {
      router.push("/dashboard");
    }, 800);
  }

  return (
    <AuthCard
      title="Crea tu cuenta"
      subtitle="Registra a tu equipo y empieza a operar el ciclo de vida de tus activos."
      footer={
        <>
          ¿Ya tienes una cuenta?{" "}
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
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Nombre completo"
            name="name"
            icon="person"
            autoComplete="name"
            placeholder="Alejandro Ramos"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
          <Input
            label="Empresa"
            name="company"
            icon="domain"
            autoComplete="organization"
            placeholder="Acme Corp"
            value={company}
            onChange={(event) => setCompany(event.target.value)}
            required
          />
        </div>

        <Input
          label="Correo corporativo"
          name="email"
          type="email"
          icon="mail"
          autoComplete="email"
          placeholder="tu.nombre@empresa.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Contraseña"
            name="password"
            type="password"
            icon="lock"
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <Input
            label="Confirmar contraseña"
            name="confirm-password"
            type="password"
            icon="lock_reset"
            autoComplete="new-password"
            placeholder="Repite la contraseña"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
          />
        </div>

        <label className="flex items-start gap-2 font-body-sm text-body-sm text-secondary">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(event) => setAccepted(event.target.checked)}
            className="mt-0.5 h-3.5 w-3.5 rounded accent-primary-container"
          />
          <span>
            Acepto los{" "}
            <span className="font-title-md text-primary-container">
              términos de servicio
            </span>{" "}
            y la{" "}
            <span className="font-title-md text-primary-container">
              política de privacidad
            </span>
            .
          </span>
        </label>

        {error ? (
          <div className="flex items-center gap-2 rounded-xl bg-error-container px-3 py-2.5 font-body-sm text-body-sm text-on-error-container">
            <Icon name="error" className="text-[18px]" filled />
            <span>{error}</span>
          </div>
        ) : null}

        <Button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl py-2.5"
        >
          {loading ? (
            <>
              <Icon
                name="progress_activity"
                className="animate-spin text-[18px]"
              />
              <span>Creando cuenta...</span>
            </>
          ) : (
            <>
              <span>Crear cuenta</span>
              <Icon name="arrow_forward" className="text-[18px]" />
            </>
          )}
        </Button>
      </form>
    </AuthCard>
  );
}
