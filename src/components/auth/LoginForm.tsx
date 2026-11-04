"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { SsoButtons } from "@/components/auth/SsoButtons";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { authService } from "@/lib/authService";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

    setLoading(true);

    authService.login({ email, password })
      .then((response) => {
        if (response.success) {
          // Redirigir al dashboard después de un breve retraso para mostrar el mensaje de éxito
          router.push("/dashboard");
        } else {
          setError(response.message || "Error desconocido al iniciar sesión.");
        }
      })
      .catch((err) => {
        console.error("Error during login:", err);
        setError("Ocurrió un error al intentar iniciar sesión.");
      })
      .finally(() => {
        setLoading(false);
      });

  }

  return (
    <AuthCard
      title="Inicia sesión"
      subtitle="Accede al panel de control de tu infraestructura y operaciones."
      footer={
        <>
          ¿No tienes una cuenta?{" "}
          <Link
            href="/register"
            className="font-title-md text-primary-container hover:underline"
          >
            Crear cuenta
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
          required
        />

        <Input
          label="Contraseña"
          name="password"
          type={showPassword ? "text" : "password"}
          icon="lock"
          autoComplete="current-password"
          placeholder="Ingresa tu contraseña"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          rightSlot={
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={
                showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
              }
              className="rounded-lg p-1.5 text-secondary transition-colors hover:bg-surface-container hover:text-on-surface"
            >
              <Icon
                name={showPassword ? "visibility_off" : "visibility"}
                className="text-[19px]"
              />
            </button>
          }
        />

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex items-center gap-2 font-body-sm text-body-sm text-secondary">
            <input
              type="checkbox"
              defaultChecked
              className="h-3.5 w-3.5 rounded accent-primary-container"
            />
            Recordarme
          </label>
          <Link
            href="/forgot-password"
            className="font-title-md text-body-sm text-primary-container hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

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
              <span>Verificando acceso...</span>
            </>
          ) : (
            <>
              <span>Entrar al panel</span>
              <Icon name="arrow_forward" className="text-[18px]" />
            </>
          )}
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-surface-variant" />
        <span className="font-label-mono-xs text-label-mono-xs uppercase tracking-wider text-secondary">
          o continúa con
        </span>
        <span className="h-px flex-1 bg-surface-variant" />
      </div>

      <SsoButtons />

      <div className="mt-5 flex items-start gap-2 rounded-xl bg-surface-container px-3 py-2.5">
        <Icon name="info" className="text-[17px] text-secondary" />
        <p className="font-body-sm text-body-sm text-secondary">
          Demo: usa cualquier correo válido y una contraseña de 6 o más
          caracteres.
        </p>
      </div>
    </AuthCard>
  );
}
