"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { cn, getErrorMessage } from "@/lib/utils";
import type {
  Actualizacion,
  Equipo,
  EquipoSoftware,
  Software,
  SolicitudActualizacionInput,
  Usuario,
} from "@/types/api";

interface DeploymentRequestModalProps {
  software: Software;
  updates: Actualizacion[];
  equipos: Equipo[];
  instalaciones: EquipoSoftware[];
  currentUser: Usuario | null;
  onClose: () => void;
  onSubmit: (
    payload: SolicitudActualizacionInput,
    equipoIds: number[],
  ) => Promise<void>;
}

const DEPLOYMENT_FORMATS = [
  {
    value: "Ventana programada",
    label: "Ventana programada",
    description: "Despliegue dentro del rango de fechas",
  },
  {
    value: "Despliegue automático",
    label: "Despliegue automático",
    description: "El agente aplica el parche sin intervención",
  },
  {
    value: "Despliegue manual",
    label: "Despliegue manual",
    description: "El responsable ejecuta la instalación",
  },
  {
    value: "Actualización en caliente",
    label: "Actualización en caliente",
    description: "Sin reinicio del servicio",
  },
];

const textAreaClassName =
  "w-full resize-y rounded-xl border border-surface-variant bg-surface-container-lowest px-4 py-2.5 font-body-md text-body-md text-on-surface placeholder:text-secondary/80 focus:border-primary-container focus:outline-none focus:ring-2 focus:ring-primary-container/20";

function toLocalInput(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function buildDefaultWindow() {
  const start = new Date();
  start.setDate(start.getDate() + 1);
  start.setHours(8, 0, 0, 0);

  const end = new Date(start);
  end.setHours(12, 0, 0, 0);

  return { start: toLocalInput(start), end: toLocalInput(end) };
}

function getInitialEquipmentSelection(
  software: Software,
  instalaciones: EquipoSoftware[],
) {
  return new Set(
    instalaciones
      .filter(
        (instalacion) =>
          instalacion.software.id === software.id &&
          instalacion.equipo.empresa.id === software.licencia.empresa.id,
      )
      .map((instalacion) => instalacion.equipo.id),
  );
}

export function DeploymentRequestModal({
  software,
  updates,
  equipos,
  instalaciones,
  currentUser,
  onClose,
  onSubmit,
}: DeploymentRequestModalProps) {
  const window = useMemo(() => buildDefaultWindow(), []);

  const [updateId, setUpdateId] = useState(
    updates[0] ? String(updates[0].id) : "",
  );
  const [formato, setFormato] = useState("Ventana programada");
  const [inicio, setInicio] = useState(window.start);
  const [fin, setFin] = useState(window.end);
  const [observaciones, setObservaciones] = useState("");
  const [selectedEquipos, setSelectedEquipos] = useState<Set<number>>(() =>
    getInitialEquipmentSelection(software, instalaciones),
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const equiposEmpresa = useMemo(
    () =>
      equipos
        .filter((equipo) => equipo.empresa.id === software.licencia.empresa.id)
        .sort((a, b) => a.nombre.localeCompare(b.nombre, "es")),
    [equipos, software.licencia.empresa.id],
  );

  const equiposConSoftware = useMemo(
    () =>
      new Set(
        instalaciones
          .filter((instalacion) => instalacion.software.id === software.id)
          .map((instalacion) => instalacion.equipo.id),
      ),
    [instalaciones, software.id],
  );

  const selectedUpdate =
    updates.find((actualizacion) => String(actualizacion.id) === updateId) ??
    null;

  function toggleEquipo(id: number) {
    setSelectedEquipos((current) => {
      const next = new Set(current);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
    setError(null);
  }

  function selectAllEquipos() {
    setSelectedEquipos(new Set(equiposEmpresa.map((equipo) => equipo.id)));
    setError(null);
  }

  function clearEquipos() {
    setSelectedEquipos(new Set());
    setError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!currentUser) {
      setError(
        "No se pudo identificar al usuario en sesión. Vuelve a iniciar sesión.",
      );
      return;
    }

    if (!selectedUpdate) {
      setError("Selecciona la actualización que deseas desplegar.");
      return;
    }

    if (!inicio || !fin) {
      setError("Define la fecha y hora de inicio y fin de la ventana.");
      return;
    }

    const start = new Date(inicio);
    const end = new Date(fin);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      setError("Las fechas de la ventana no son válidas.");
      return;
    }

    if (end <= start) {
      setError("La fecha de fin debe ser posterior a la fecha de inicio.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await onSubmit(
        {
          empresa: { id: software.licencia.empresa.id },
          actualizacion: { id: selectedUpdate.id },
          solicitante: { id: currentUser.id },
          estado: "PENDIENTE",
          formatoDespliegue: formato,
          fechaInicioRango: start.toISOString(),
          fechaFinRango: end.toISOString(),
          observaciones: observaciones.trim() || null,
        },
        Array.from(selectedEquipos),
      );
      onClose();
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title="Solicitar despliegue"
      description={`${software.nombre} · ${software.licencia.empresa.nombre}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form="deployment-request-form"
            disabled={saving || updates.length === 0}
          >
            <Icon
              name={saving ? "progress_activity" : "rocket_launch"}
              className={saving ? "animate-spin text-[17px]" : "text-[17px]"}
            />
            <span>{saving ? "Enviando..." : "Enviar solicitud"}</span>
          </Button>
        </>
      }
    >
      {error ? (
        <div className="mb-4 flex items-start gap-2 rounded-xl bg-error-container px-3 py-2.5 font-body-sm text-body-sm text-on-error-container">
          <Icon name="error" className="mt-0.5 text-[18px]" filled />
          <span>{error}</span>
        </div>
      ) : null}

      {updates.length === 0 ? (
        <div className="mb-4 flex flex-col items-center gap-2 rounded-xl border border-dashed border-surface-variant px-4 py-6 text-center">
          <Icon
            name="system_update_alt"
            className="text-[26px] text-secondary"
          />
          <span className="font-title-md text-body-sm text-on-surface">
            No hay actualizaciones publicadas
          </span>
          <span className="max-w-md font-body-sm text-body-sm text-secondary">
            Publica una actualización de {software.nombre} antes de solicitar su
            despliegue.
          </span>
        </div>
      ) : null}

      <form
        id="deployment-request-form"
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-dark px-4 py-3.5 text-on-dark">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-on-dark/10">
              <Icon name="apps" className="text-[22px]" />
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="truncate font-headline-sm text-headline-sm text-on-dark">
                {software.nombre}
              </span>
              <span className="truncate font-label-mono-xs text-label-mono-xs text-on-dark/70">
                {software.licencia.empresa.nombre} · Licencia #
                {software.licencia.codigoClave}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 font-code-md text-code-md">
            <span className="text-on-dark/70">{software.versionActual}</span>
            <Icon name="arrow_forward" className="text-[15px]" />
            <span className="font-semibold text-primary-container">
              {selectedUpdate?.versionDestino ?? "—"}
            </span>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Actualización a desplegar"
            id="deployment-update"
            value={updateId}
            onChange={setUpdateId}
            options={updates.map((actualizacion) => ({
              value: String(actualizacion.id),
              label: `v${actualizacion.versionDestino}`,
              description: `Desde v${
                actualizacion.versionOrigen || software.versionActual
              } · ${actualizacion.tipoCambio}`,
            }))}
            placeholder="Selecciona una actualización"
            searchable={updates.length > 6}
            emptyMessage="No hay actualizaciones disponibles"
            disabled={updates.length === 0}
            required
          />
          
          <Select
            label="Formato de despliegue"
            id="deployment-format"
            value={formato}
            onChange={setFormato}
            options={DEPLOYMENT_FORMATS}
            searchable={false}
            required
          />

          <Input
            label="Inicio de la ventana"
            name="fechaInicioRango"
            type="datetime-local"
            value={inicio}
            onChange={(event) => setInicio(event.target.value)}
            required
          />

          <Input
            label="Fin de la ventana"
            name="fechaFinRango"
            type="datetime-local"
            value={fin}
            min={inicio}
            onChange={(event) => setFin(event.target.value)}
            required
          />

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label
              htmlFor="deployment-observaciones"
              className="font-label-mono-xs text-label-mono-xs uppercase tracking-wider text-secondary"
            >
              Observaciones
            </label>
            <textarea
              id="deployment-observaciones"
              value={observaciones}
              onChange={(event) => setObservaciones(event.target.value)}
              rows={3}
              placeholder="Indica el motivo del despliegue, dependencias o precauciones..."
              className={textAreaClassName}
            />
          </div>
        </div>

        <section className="flex flex-col gap-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h3 className="font-title-md text-body-md text-on-surface">
                Equipos a desplegar
              </h3>
              <span className="rounded-full bg-surface-container px-2.5 py-0.5 font-label-mono-xs text-label-mono-xs text-secondary">
                {selectedEquipos.size} seleccionado
                {selectedEquipos.size === 1 ? "" : "s"}
              </span>
            </div>

            {equiposEmpresa.length ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={selectAllEquipos}
                  className="rounded-lg px-2 py-1 font-label-mono-xs text-label-mono-xs text-secondary transition-colors hover:bg-surface-container hover:text-on-surface"
                >
                  Seleccionar todos
                </button>
                <button
                  type="button"
                  onClick={clearEquipos}
                  className="rounded-lg px-2 py-1 font-label-mono-xs text-label-mono-xs text-secondary transition-colors hover:bg-surface-container hover:text-on-surface"
                >
                  Limpiar
                </button>
              </div>
            ) : null}
          </div>

          {equiposEmpresa.length ? (
            <ul className="flex max-h-64 flex-col gap-2 overflow-y-auto pr-1">
              {equiposEmpresa.map((equipo) => {
                const checked = selectedEquipos.has(equipo.id);
                const installed = equiposConSoftware.has(equipo.id);

                return (
                  <li key={equipo.id}>
                    <label
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors",
                        checked
                          ? "border-primary-container bg-primary-container/[0.04]"
                          : "border-surface-variant bg-surface-container-lowest",
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleEquipo(equipo.id)}
                        className="h-4 w-4 shrink-0 cursor-pointer accent-primary-container"
                      />

                      <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                        <div className="flex min-w-0 flex-col">
                          <span className="truncate font-title-md text-body-sm text-on-surface">
                            {equipo.nombre}
                          </span>
                          <span className="truncate font-label-mono-xs text-label-mono-xs text-secondary">
                            {[equipo.tipo, equipo.ip, equipo.ubicacion]
                              .filter(Boolean)
                              .join(" · ") || "Sin datos de red"}
                          </span>
                        </div>

                        <Badge tone={installed ? "success" : "neutral"}>
                          <Icon
                            name={installed ? "check_circle" : "devices"}
                            className="text-[13px]"
                          />
                          {installed ? "Software instalado" : "Sin registro"}
                        </Badge>
                      </div>
                    </label>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="rounded-xl border border-dashed border-surface-variant px-4 py-4 text-center font-body-sm text-body-sm text-secondary">
              No hay equipos registrados para {software.licencia.empresa.nombre}.
              Puedes enviar la solicitud y asignar equipos después.
            </div>
          )}
        </section>
      </form>
    </Modal>
  );
}
