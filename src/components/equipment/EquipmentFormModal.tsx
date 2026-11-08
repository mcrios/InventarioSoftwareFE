"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  EQUIPMENT_TYPES,
  HEALTH_STATES,
} from "@/components/equipment/equipmentMeta";
import {
  getLicenseExpiryMeta,
  type SoftwareAssignment,
} from "@/components/equipment/equipmentSoftware";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { formatDate } from "@/lib/format";
import { cn, getErrorMessage } from "@/lib/utils";
import type {
  Empresa,
  Equipo,
  EquipoInput,
  Software,
  Usuario,
} from "@/types/api";

interface EquipmentFormModalProps {
  open: boolean;
  equipo: Equipo | null;
  empresas: Empresa[];
  usuarios: Usuario[];
  software: Software[];
  onClose: () => void;
  onSubmit: (
    input: EquipoInput,
    instalaciones: SoftwareAssignment[],
  ) => Promise<void>;
}

interface EquipmentFormState {
  nombre: string;
  empresaId: string;
  tipo: string;
  responsableId: string;
  fabricante: string;
  ip: string;
  ubicacion: string;
  salud: string;
}

function buildFormState(
  equipo: Equipo | null,
  empresas: Empresa[],
): EquipmentFormState {
  return {
    nombre: equipo?.nombre ?? "",
    empresaId: String(equipo?.empresa.id ?? empresas[0]?.id ?? ""),
    tipo: equipo?.tipo ?? "",
    responsableId: equipo?.responsable ? String(equipo.responsable.id) : "",
    fabricante: equipo?.fabricante ?? "",
    ip: equipo?.ip ?? "",
    ubicacion: equipo?.ubicacion ?? "",
    salud: equipo?.salud ?? "",
  };
}

function nullable(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function StepIndicator({ step }: { step: 1 | 2 }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-label-mono-xs text-label-mono-xs font-bold",
            step > 1
              ? "bg-primary-container text-on-primary"
              : "bg-dark text-on-dark",
          )}
        >
          {step > 1 ? <Icon name="check" className="text-[14px]" /> : "1"}
        </span>
        <span
          className={cn(
            "font-title-md text-body-sm",
            step === 1 ? "text-on-surface" : "text-secondary",
          )}
        >
          Datos del equipo
        </span>
      </div>

      <span
        className={cn(
          "h-px flex-1",
          step > 1 ? "bg-primary-container" : "bg-surface-variant",
        )}
      />

      <div className="flex items-center gap-2">
        <span
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-label-mono-xs text-label-mono-xs font-bold",
            step === 2
              ? "bg-primary-container text-on-primary"
              : "bg-surface-container text-secondary",
          )}
        >
          2
        </span>
        <span
          className={cn(
            "font-title-md text-body-sm",
            step === 2 ? "text-on-surface" : "text-secondary",
          )}
        >
          Software instalado
        </span>
      </div>
    </div>
  );
}

export function EquipmentFormModal({
  open,
  equipo,
  empresas,
  usuarios,
  software,
  onClose,
  onSubmit,
}: EquipmentFormModalProps) {
  const [form, setForm] = useState<EquipmentFormState>(() =>
    buildFormState(equipo, empresas),
  );
  const [step, setStep] = useState<1 | 2>(1);
  const [selected, setSelected] = useState<Record<number, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const editing = Boolean(equipo);

  const empresaOptions = useMemo(() => {
    if (equipo && !empresas.some((item) => item.id === equipo.empresa.id)) {
      return [...empresas, equipo.empresa];
    }

    return empresas;
  }, [empresas, equipo]);

  const typeOptions = useMemo(() => {
    const values = new Set<string>(EQUIPMENT_TYPES);

    if (equipo?.tipo) values.add(equipo.tipo);

    return Array.from(values);
  }, [equipo]);

  const healthOptions = useMemo(() => {
    const values = new Set<string>(HEALTH_STATES);

    if (equipo?.salud) values.add(equipo.salud);

    return Array.from(values);
  }, [equipo]);

  const responsableOptions = useMemo(() => {
    const empresaId = Number(form.empresaId);
    let list = usuarios;

    if (empresaId) {
      const deLaEmpresa = usuarios.filter((usuario) =>
        usuario.empresas?.some((empresa) => empresa.id === empresaId),
      );

      if (deLaEmpresa.length) list = deLaEmpresa;
    }

    const actual = equipo?.responsable;

    if (
      actual &&
      form.responsableId === String(actual.id) &&
      !list.some((usuario) => usuario.id === actual.id)
    ) {
      list = [...list, actual];
    }

    return list;
  }, [equipo, form, usuarios]);

  const availableSoftware = useMemo(() => {
    const empresaId = Number(form.empresaId);

    if (!empresaId) return [];

    return software
      .filter((item) => item.licencia?.empresa?.id === empresaId)
      .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
  }, [form, software]);

  const empresaNombre =
    empresaOptions.find((empresa) => String(empresa.id) === form.empresaId)
      ?.nombre ?? null;

  const selectedCount = Object.keys(selected).length;

  function updateField(field: keyof EquipmentFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setError(null);
  }

  function handleEmpresaChange(value: string) {
    setForm((current) => ({
      ...current,
      empresaId: value,
      responsableId: "",
    }));
    setSelected({});
    setError(null);
  }

  function validateDetails() {
    const nombre = form.nombre.trim();
    const tipo = form.tipo.trim();

    if (!nombre) {
      setError("El nombre del equipo es obligatorio.");
      return false;
    }

    if (!Number(form.empresaId)) {
      setError("Selecciona la empresa a la que pertenece el equipo.");
      return false;
    }

    if (!tipo) {
      setError("Selecciona o escribe el tipo de equipo.");
      return false;
    }

    return true;
  }

  function goToSoftwareStep() {
    if (!validateDetails()) return;

    setError(null);
    setStep(2);
  }

  function toggleSoftware(item: Software) {
    setSelected((current) => {
      const next = { ...current };

      if (item.id in next) {
        delete next[item.id];
      } else {
        next[item.id] = item.versionActual;
      }

      return next;
    });
    setError(null);
  }

  function updateVersion(softwareId: number, value: string) {
    setSelected((current) => ({ ...current, [softwareId]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validateDetails()) return;

    if (!editing && step === 1) {
      setError(null);
      setStep(2);
      return;
    }

    const empresaId = Number(form.empresaId);
    const instalaciones: SoftwareAssignment[] = Object.entries(
      selected,
    ).flatMap(([softwareId, version]) => {
      const item = software.find((entry) => entry.id === Number(softwareId));

      if (!item) return [];

      return [
        {
          softwareId: item.id,
          licenciaId: item.licencia?.id ?? null,
          versionInstalada: version.trim() || item.versionActual,
        },
      ];
    });

    setSaving(true);
    setError(null);

    try {
      await onSubmit(
        {
          nombre: form.nombre.trim(),
          tipo: form.tipo.trim(),
          empresa: { id: empresaId },
          responsable: form.responsableId
            ? { id: Number(form.responsableId) }
            : null,
          fabricante: nullable(form.fabricante),
          ip: nullable(form.ip),
          ubicacion: nullable(form.ubicacion),
          salud: nullable(form.salud),
        },
        editing ? [] : instalaciones,
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
      open={open}
      onClose={onClose}
      size="lg"
      title={editing ? "Editar equipo" : "Nuevo equipo"}
      description={
        editing
          ? "Actualiza la ficha del equipo sin alterar el software instalado."
          : "Paso 1: registra los datos del equipo. Paso 2: asigna el software con licencia de su empresa."
      }
      footer={
        editing ? (
          <>
            <Button variant="secondary" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button
              type="submit"
              form="equipment-form"
              disabled={saving || empresaOptions.length === 0}
            >
              <Icon
                name={saving ? "progress_activity" : "save"}
                className={cn("text-[17px]", saving && "animate-spin")}
              />
              <span>{saving ? "Guardando..." : "Guardar cambios"}</span>
            </Button>
          </>
        ) : step === 1 ? (
          <>
            <Button variant="secondary" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button
              onClick={goToSoftwareStep}
              disabled={empresaOptions.length === 0}
            >
              <span>Siguiente</span>
              <Icon name="arrow_forward" className="text-[17px]" />
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setError(null);
                setStep(1);
              }}
              disabled={saving}
            >
              <Icon name="arrow_back" className="text-[17px]" />
              <span>Atrás</span>
            </Button>
            <Button type="submit" form="equipment-form" disabled={saving}>
              <Icon
                name={saving ? "progress_activity" : "save"}
                className={cn("text-[17px]", saving && "animate-spin")}
              />
              <span>{saving ? "Creando..." : "Crear equipo"}</span>
            </Button>
          </>
        )
      }
    >
      {editing ? null : <StepIndicator step={step} />}

      {error ? (
        <div className="mb-4 flex items-start gap-2 rounded-xl bg-error-container px-3 py-2.5 font-body-sm text-body-sm text-on-error-container">
          <Icon name="error" className="mt-0.5 text-[18px]" filled />
          <span>{error}</span>
        </div>
      ) : null}

      <form
        id="equipment-form"
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
      >
        {editing || step === 1 ? (
          <>
            {empresaOptions.length === 0 ? (
              <div className="flex items-start gap-2 rounded-xl bg-surface-container-low px-3 py-2.5 font-body-sm text-body-sm text-secondary">
                <Icon name="info" className="mt-0.5 text-[18px]" />
                <span>
                  No hay empresas registradas. Crea una empresa antes de dar de
                  alta equipos.
                </span>
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Nombre del equipo"
                name="nombre"
                icon="devices"
                value={form.nombre}
                onChange={(event) => updateField("nombre", event.target.value)}
                placeholder="Ej. LAP-ENG-082"
                hint="Hostname o nombre con el que se identifica en la red."
                required
              />

              <Select
                label="Empresa"
                id="equipo-empresa"
                value={form.empresaId}
                onChange={handleEmpresaChange}
                options={empresaOptions.map((empresa) => ({
                  value: String(empresa.id),
                  label: empresa.nombre,
                  description: empresa.identificador ?? undefined,
                }))}
                placeholder="Selecciona una empresa"
                searchPlaceholder="Buscar empresa..."
                emptyMessage="No hay empresas que coincidan"
                required
              />

              <Select
                label="Tipo de equipo"
                id="equipo-tipo"
                value={form.tipo}
                onChange={(value) => updateField("tipo", value)}
                options={typeOptions.map((option) => ({
                  value: option,
                  label: option,
                }))}
                placeholder="Selecciona un tipo"
                searchPlaceholder="Buscar tipo..."
                required
              />

              <Select
                label="Responsable"
                id="equipo-responsable"
                value={form.responsableId}
                onChange={(value) => updateField("responsableId", value)}
                options={[
                  { value: "", label: "Sin asignar" },
                  ...responsableOptions.map((usuario) => ({
                    value: String(usuario.id),
                    label: usuario.nombre,
                    description: usuario.email,
                  })),
                ]}
                searchPlaceholder="Buscar responsable por nombre o correo..."
                emptyMessage="No hay responsables que coincidan"
              />

              <Input
                label="Fabricante"
                name="fabricante"
                icon="factory"
                value={form.fabricante}
                onChange={(event) =>
                  updateField("fabricante", event.target.value)
                }
                placeholder="Ej. Dell, Lenovo, Apple"
              />

              <Input
                label="Dirección IP"
                name="ip"
                icon="lan"
                value={form.ip}
                onChange={(event) => updateField("ip", event.target.value)}
                placeholder="Ej. 10.240.12.84"
                hint="Opcional. IPv4 o nombre de host."
              />

              <Input
                label="Ubicación"
                name="ubicacion"
                icon="location_on"
                value={form.ubicacion}
                onChange={(event) =>
                  updateField("ubicacion", event.target.value)
                }
                placeholder="Ej. Sede central, piso 3"
                containerClassName="sm:col-span-2"
              />

              <Select
                label="Estado de salud"
                id="equipo-salud"
                value={form.salud}
                onChange={(value) => updateField("salud", value)}
                options={[
                  { value: "", label: "Sin especificar" },
                  ...healthOptions.map((option) => ({
                    value: option,
                    label: option,
                  })),
                ]}
                searchable={false}
                containerClassName="sm:col-span-2"
              />
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-2 rounded-xl bg-surface-container-low px-3 py-2.5 font-body-sm text-body-sm text-secondary">
              <Icon name="info" className="mt-0.5 text-[18px]" />
              <span>
                Software con licencia de{" "}
                <strong className="text-on-surface">
                  {empresaNombre ?? "la empresa seleccionada"}
                </strong>
                . Marca lo que esté instalado y ajusta la versión si es distinta
                a la del catálogo. Puedes continuar sin seleccionar software y
                asignarlo después desde la ficha técnica.
              </span>
            </div>

            {availableSoftware.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-surface-variant px-4 py-8 text-center">
                <Icon name="apps" className="text-[26px] text-secondary" />
                <span className="font-title-md text-body-sm text-on-surface">
                  No hay software disponible para esta empresa
                </span>
                <span className="max-w-md font-body-sm text-body-sm text-secondary">
                  Registra software y su licencia para la empresa antes de
                  asignarlo a un equipo.
                </span>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-label-mono-xs text-label-mono-xs uppercase tracking-wider text-secondary">
                    Software disponible
                  </span>
                  <span className="rounded-full bg-surface-container px-2.5 py-0.5 font-label-mono-xs text-label-mono-xs text-secondary">
                    {selectedCount} seleccionado
                    {selectedCount === 1 ? "" : "s"}
                  </span>
                </div>

                <ul className="flex flex-col gap-2">
                  {availableSoftware.map((item) => {
                    const version = selected[item.id];
                    const isSelected = version !== undefined;
                    const expiry = getLicenseExpiryMeta(
                      item.licencia?.fechaVencimiento,
                    );

                    return (
                      <li
                        key={item.id}
                        className={cn(
                          "rounded-xl border p-3 transition-colors",
                          isSelected
                            ? "border-primary-container bg-primary-container/[0.04]"
                            : "border-surface-variant bg-surface-container-lowest",
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            id={`equipo-software-${item.id}`}
                            checked={isSelected}
                            onChange={() => toggleSoftware(item)}
                            className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-primary-container"
                          />

                          <div className="flex min-w-0 flex-1 flex-col gap-1">
                            <label
                              htmlFor={`equipo-software-${item.id}`}
                              className="flex cursor-pointer flex-wrap items-center gap-2"
                            >
                              <span className="font-title-md text-body-sm text-on-surface">
                                {item.nombre}
                              </span>
                              <span className="rounded bg-surface-container px-2 py-0.5 font-label-mono-xs text-label-mono-xs text-secondary">
                                catálogo v{item.versionActual}
                              </span>
                              {expiry.state === "expired" ||
                              expiry.state === "soon" ? (
                                <Badge tone={expiry.tone}>
                                  <Icon
                                    name={expiry.icon}
                                    className="text-[13px]"
                                  />
                                  {expiry.label}
                                </Badge>
                              ) : null}
                            </label>

                            <span className="font-label-mono-xs text-label-mono-xs text-secondary">
                              {[item.fabricante, item.tipoSoftware?.nombre]
                                .filter(Boolean)
                                .join(" · ") || "Sin fabricante"}
                            </span>

                            <span className="font-label-mono-xs text-label-mono-xs text-secondary">
                              Licencia #{item.licencia?.id ?? "—"} ·{" "}
                              {item.licencia
                                ? `${item.licencia.cantidadUsada}/${item.licencia.cantidadTotal} asientos`
                                : "Sin licencia asociada"}
                              {item.licencia?.fechaVencimiento
                                ? ` · Vence ${formatDate(item.licencia.fechaVencimiento)}`
                                : ""}
                            </span>

                            {isSelected ? (
                              <div className="mt-1.5 max-w-xs">
                                <Input
                                  label="Versión instalada"
                                  name={`version-${item.id}`}
                                  icon="tag"
                                  value={version}
                                  onChange={(event) =>
                                    updateVersion(item.id, event.target.value)
                                  }
                                  placeholder={item.versionActual}
                                  hint={`Versión del catálogo: ${item.versionActual}`}
                                />
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </div>
        )}
      </form>
    </Modal>
  );
}
