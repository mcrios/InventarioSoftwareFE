"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { securityService } from "@/lib/securityService";
import { cn, getErrorMessage } from "@/lib/utils";
import type { Usuario, UsuarioInput } from "@/types/api";

interface ProfileFormProps {
  usuario: Usuario;
  onUpdated: (usuario: Usuario) => void;
}

interface ProfileFormState {
  nombre: string;
  email: string;
  password: string;
  confirmPassword: string;
}

type ProfileFormErrors = Partial<Record<keyof ProfileFormState, string>>;

function buildFormState(usuario: Usuario): ProfileFormState {
  return {
    nombre: usuario.nombre,
    email: usuario.email,
    password: "",
    confirmPassword: "",
  };
}

interface PasswordFieldProps {
  label: string;
  name: string;
  value: string;
  autoComplete: string;
  error?: string;
  hint?: string;
  onChange: (value: string) => void;
}

function PasswordField({
  label,
  name,
  value,
  autoComplete,
  error,
  hint,
  onChange,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <Input
      label={label}
      name={name}
      type={visible ? "text" : "password"}
      icon="lock"
      autoComplete={autoComplete}
      value={value}
      error={error}
      hint={hint}
      onChange={(event) => onChange(event.target.value)}
      placeholder="••••••••"
      rightSlot={
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          className="rounded-lg p-1.5 text-secondary transition-colors hover:bg-surface-container hover:text-on-surface"
        >
          <Icon
            name={visible ? "visibility_off" : "visibility"}
            className="text-[19px]"
          />
        </button>
      }
    />
  );
}

export function ProfileForm({ usuario, onUpdated }: ProfileFormProps) {
  const [form, setForm] = useState<ProfileFormState>(() =>
    buildFormState(usuario),
  );
  const [errors, setErrors] = useState<ProfileFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const dirty =
    form.nombre.trim() !== usuario.nombre ||
    form.email.trim().toLowerCase() !== usuario.email.toLowerCase() ||
    Boolean(form.password || form.confirmPassword);

  function updateField(field: keyof ProfileFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFormError(null);
  }

  function validate() {
    const nextErrors: ProfileFormErrors = {};

    if (!form.nombre.trim()) {
      nextErrors.nombre = "El nombre completo es obligatorio.";
    }

    const email = form.email.trim();

    if (!email) {
      nextErrors.email = "El correo corporativo es obligatorio.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = "Ingresa un correo válido.";
    }

    if (form.password && form.password.length < 8) {
      nextErrors.password = "La contraseña debe tener al menos 8 caracteres.";
    }

    if (form.confirmPassword && !form.password) {
      nextErrors.password = "Escribe la nueva contraseña.";
    }

    if (form.password && form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = "Las contraseñas no coinciden.";
    }

    return nextErrors;
  }

  function resetForm() {
    setForm(buildFormState(usuario));
    setErrors({});
    setFormError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validate();

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setSaving(true);
    setFormError(null);

    const payload: UsuarioInput = {
      nombre: form.nombre.trim(),
      email: form.email.trim(),
      activo: usuario.activo,
      roles: usuario.roles.map((role) => ({ id: role.id })),
      empresas: usuario.empresas.map((empresa) => ({ id: empresa.id })),
      ...(form.password ? { password: form.password } : {}),
    };

    try {
      const updated = await securityService.updateUsuario(usuario.id, payload);

      setForm(buildFormState(updated));
      setErrors({});
      onUpdated(updated);
    } catch (updateError) {
      setFormError(getErrorMessage(updateError));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex items-start gap-3 border-b border-surface-variant px-5 py-4 sm:px-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-container text-on-surface">
          <Icon name="manage_accounts" className="text-[21px]" />
        </div>
        <div className="flex flex-col gap-1">
          <h2 className="font-headline-sm text-headline-sm text-on-surface">
            Datos de la cuenta
          </h2>
          <p className="font-body-sm text-body-sm text-secondary">
            Actualiza tu información personal y la forma en que accedes a la
            plataforma.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col">
        <div className="flex flex-col gap-5 px-5 py-5 sm:px-6">
          <section className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Icon name="person" className="text-[18px] text-secondary" />
              <h3 className="font-title-md text-body-md text-on-surface">
                Información personal
              </h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Nombre completo"
                name="nombre"
                icon="badge"
                autoComplete="name"
                value={form.nombre}
                onChange={(event) => updateField("nombre", event.target.value)}
                error={errors.nombre}
                placeholder="Nombre y apellido"
                required
              />
              <Input
                label="Correo corporativo"
                name="email"
                type="email"
                icon="mail"
                autoComplete="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                error={errors.email}
                placeholder="usuario@empresa.com"
                required
              />
            </div>
          </section>

          <div className="h-px w-full bg-surface-variant" />

          <section className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Icon name="lock" className="text-[18px] text-secondary" />
                <h3 className="font-title-md text-body-md text-on-surface">
                  Seguridad
                </h3>
              </div>
              <span className="rounded-full bg-surface-container px-2.5 py-0.5 font-label-mono-xs text-label-mono-xs text-secondary">
                OPCIONAL
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <PasswordField
                label="Nueva contraseña"
                name="password"
                value={form.password}
                autoComplete="new-password"
                onChange={(value) => updateField("password", value)}
                error={errors.password}
                hint="Mínimo 8 caracteres."
              />
              <PasswordField
                label="Confirmar contraseña"
                name="confirmPassword"
                value={form.confirmPassword}
                autoComplete="new-password"
                onChange={(value) => updateField("confirmPassword", value)}
                error={errors.confirmPassword}
              />
            </div>

            <div className="flex items-start gap-2 rounded-xl bg-surface-container-low px-3 py-2.5">
              <Icon name="info" className="mt-0.5 text-[17px] text-secondary" />
              <p className="font-body-sm text-body-sm text-secondary">
                Deja los campos de contraseña vacíos para conservar la clave
                actual. Si cambias tu correo, úsalo en tu próximo inicio de
                sesión.
              </p>
            </div>
          </section>

          {formError ? (
            <div className="flex items-start gap-2 rounded-xl bg-error-container px-3 py-2.5 font-body-sm text-body-sm text-on-error-container">
              <Icon name="error" className="mt-0.5 text-[18px]" filled />
              <span>{formError}</span>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 border-t border-surface-variant bg-surface-container-low px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span
            className={cn(
              "flex items-center gap-1.5 font-label-mono-xs text-label-mono-xs",
              dirty ? "text-primary-container" : "text-secondary",
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                dirty ? "bg-primary-container" : "bg-surface-dim",
              )}
            />
            {dirty ? "Cambios sin guardar" : "Sin cambios pendientes"}
          </span>

          <div className="flex items-center justify-end gap-2">
            <Button
              variant="secondary"
              onClick={resetForm}
              disabled={!dirty || saving}
            >
              <Icon name="undo" className="text-[17px]" />
              <span>Descartar</span>
            </Button>
            <Button type="submit" disabled={!dirty || saving}>
              <Icon
                name={saving ? "progress_activity" : "save"}
                className={cn("text-[17px]", saving && "animate-spin")}
              />
              <span>{saving ? "Guardando..." : "Guardar cambios"}</span>
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
}
