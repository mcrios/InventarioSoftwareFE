"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { formatDateTime } from "@/lib/format";
import { cn, getErrorMessage } from "@/lib/utils";
import type { Empresa, EmpresaInput } from "@/types/api";

type EditableField = "nombre" | "identificador";

interface CompanyDraft {
  nombre: string;
  identificador: string;
  activo: boolean;
}

interface CompanyRowProps {
  empresa: Empresa;
  onUpdate: (id: number, input: EmpresaInput) => Promise<void>;
  onDelete: (empresa: Empresa) => void;
}

function buildDraft(empresa: Empresa): CompanyDraft {
  return {
    nombre: empresa.nombre,
    identificador: empresa.identificador ?? "",
    activo: empresa.activo,
  };
}

export function CompanyRow({ empresa, onUpdate, onDelete }: CompanyRowProps) {
  const [editing, setEditing] = useState(false);
  const [activeField, setActiveField] = useState<EditableField>("nombre");
  const [draft, setDraft] = useState<CompanyDraft>(() => buildDraft(empresa));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nombreRef = useRef<HTMLInputElement>(null);
  const identificadorRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) return;

    const input =
      activeField === "nombre" ? nombreRef.current : identificadorRef.current;

    input?.focus();
    input?.select();
  }, [editing, activeField]);

  const nombre = draft.nombre.trim();
  const identificador = draft.identificador.trim();
  const originalIdentificador = (empresa.identificador ?? "").trim();

  const dirty =
    nombre !== empresa.nombre.trim() ||
    identificador !== originalIdentificador ||
    draft.activo !== empresa.activo;

  const canSave = dirty && nombre.length > 0 && !saving;

  function startEditing(
    field: EditableField = "nombre",
    toggleStatus = false,
  ) {
    const next = buildDraft(empresa);

    setDraft(
      toggleStatus ? { ...next, activo: !next.activo } : next,
    );
    setActiveField(field);
    setError(null);
    setEditing(true);
  }

  function cancelEditing() {
    setDraft(buildDraft(empresa));
    setError(null);
    setEditing(false);
  }

  function toggleActive() {
    setDraft((current) => ({ ...current, activo: !current.activo }));
  }

  async function handleSave() {
    if (!canSave) return;

    setSaving(true);
    setError(null);

    try {
      await onUpdate(empresa.id, {
        nombre,
        identificador: identificador || null,
        activo: draft.activo,
      });
      setEditing(false);
    } catch (saveError) {
      setError(getErrorMessage(saveError));
    } finally {
      setSaving(false);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      void handleSave();
    }

    if (event.key === "Escape") {
      event.preventDefault();
      cancelEditing();
    }
  }

  return (
    <tr
      className={cn(
        "group transition-colors hover:bg-surface-container-low",
        editing &&
          "bg-surface-container-low/80 [box-shadow:inset_3px_0_0_#D94500]",
      )}
    >
      <td className="px-4 py-3.5">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-container text-on-surface shadow-sm">
            <Icon name="corporate_fare" className="text-[20px]" />
          </div>

          <div className="flex min-w-0 flex-1 flex-col">
            <span className="mt-0.5 font-label-mono-xs text-label-mono-xs text-secondary">
              ID #{empresa.id}
            </span>
            {editing ? (
              <input
                ref={nombreRef}
                value={draft.nombre}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    nombre: event.target.value,
                  }))
                }
                onKeyDown={handleKeyDown}
                maxLength={120}
                aria-label="Nombre de la empresa"
                className="w-full rounded-lg border border-primary-container bg-surface-container-lowest px-2.5 py-1.5 font-title-md text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container/20"
              />
            ) : (
              <span
                role="button"
                tabIndex={0}
                title="Doble clic para editar el nombre"
                onDoubleClick={() => startEditing("nombre")}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === "F2") {
                    event.preventDefault();
                    startEditing("nombre");
                  }
                }}
                className="group/cell -mx-1 flex cursor-text items-center gap-1.5 rounded-lg px-1 py-0.5 font-title-md text-body-sm text-on-surface transition-colors hover:bg-surface-container focus:bg-surface-container focus:outline-none"
              >
                <span className="truncate">{empresa.nombre}</span>
                <Icon
                  name="edit"
                  className="shrink-0 text-[14px] text-secondary opacity-0 transition-opacity group-hover/cell:opacity-100"
                />
              </span>
            )}

            {error ? (
              <span className="mt-1 flex items-start gap-1 font-label-mono-xs text-label-mono-xs text-error">
                <Icon name="error" className="text-[13px]" filled />
                <span>{error}</span>
              </span>
            ) : null}
          </div>
        </div>
      </td>

      <td className="px-4 py-3.5">
        {editing ? (
          <input
            ref={identificadorRef}
            value={draft.identificador}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                identificador: event.target.value,
              }))
            }
            onKeyDown={handleKeyDown}
            maxLength={60}
            placeholder="Opcional"
            aria-label="Identificador de la empresa"
            className="w-full rounded-lg border border-primary-container bg-surface-container-lowest px-2.5 py-1.5 font-code-md text-code-md text-on-surface placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-primary-container/20"
          />
        ) : (
          <span
            role="button"
            tabIndex={0}
            title="Doble clic para editar el identificador"
            onDoubleClick={() => startEditing("identificador")}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === "F2") {
                event.preventDefault();
                startEditing("identificador");
              }
            }}
            className="group/cell -mx-1 flex w-fit cursor-text items-center gap-1.5 rounded-lg px-1 py-0.5 transition-colors hover:bg-surface-container focus:bg-surface-container focus:outline-none"
          >
            <span
              className={cn(
                "font-code-md text-code-md font-semibold",
                empresa.identificador ? "text-on-surface" : "text-secondary",
              )}
            >
              {empresa.identificador || "—"}
            </span>
            <Icon
              name="edit"
              className="text-[14px] text-secondary opacity-0 transition-opacity group-hover/cell:opacity-100"
            />
          </span>
        )}
      </td>

      <td className="px-4 py-3.5">
        {editing ? (
          <button
            type="button"
            onClick={toggleActive}
            title="Cambiar estado de la empresa"
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-label-mono-xs text-label-mono-xs font-semibold transition-colors",
              draft.activo
                ? "bg-primary-container/15 text-on-surface hover:bg-primary-container/25"
                : "bg-surface-container text-secondary hover:bg-surface-container-high",
            )}
          >
            <Icon
              name={draft.activo ? "toggle_on" : "toggle_off"}
              className={cn(
                "text-[18px]",
                draft.activo && "text-primary-container",
              )}
            />
            <span>{draft.activo ? "Activa" : "Inactiva"}</span>
          </button>
        ) : (
          <span
            role="button"
            tabIndex={0}
            title="Doble clic para cambiar el estado"
            onDoubleClick={() => startEditing("nombre", true)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === "F2") {
                event.preventDefault();
                startEditing("nombre", true);
              }
            }}
            className="inline-flex rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-container/20"
          >
            <Badge tone={empresa.activo ? "success" : "danger"}>
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  empresa.activo ? "bg-primary-container" : "bg-current",
                )}
              />
              {empresa.activo ? "Activa" : "Inactiva"}
            </Badge>
          </span>
        )}
      </td>

      <td className="px-4 py-3.5">
        <div className="flex flex-col">
          <span className="font-body-sm text-body-sm text-on-surface">
            {formatDateTime(empresa.fechaCreacion)}
          </span>
          <span className="font-label-mono-xs text-label-mono-xs text-secondary">
            Alta en el sistema
          </span>
        </div>
      </td>

      <td className="px-4 py-3.5">
        <div className="flex items-center justify-end gap-1">
          {editing ? (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={cancelEditing}
                disabled={saving}
                title="Descartar cambios"
              >
                <Icon name="close" className="text-[16px]" />
                <span>Cancelar</span>
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => void handleSave()}
                disabled={!canSave}
                title="Guardar cambios"
              >
                <Icon
                  name={saving ? "progress_activity" : "save"}
                  className={cn(
                    "text-[16px]",
                    saving && "animate-spin",
                  )}
                />
                <span>{saving ? "Guardando..." : "Guardar"}</span>
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Editar ${empresa.nombre}`}
                title="Editar empresa"
                onClick={() => startEditing("nombre")}
              >
                <Icon name="edit" className="text-[18px]" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Eliminar ${empresa.nombre}`}
                title="Eliminar empresa"
                className="text-error hover:bg-error-container"
                onClick={() => onDelete(empresa)}
              >
                <Icon name="delete" className="text-[18px]" />
              </Button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}
