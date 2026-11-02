"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, buttonStyles } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

export function NewAssetForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    window.setTimeout(() => {
      router.push("/inventory");
    }, 700);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Card className="p-5 sm:p-6">
        <div className="mb-5 flex items-center gap-2">
          <Icon name="dns" className="text-[20px] text-primary-container" />
          <h2 className="font-headline-sm text-headline-sm text-on-surface">
            Identificación del activo
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Hostname"
            name="hostname"
            icon="badge"
            placeholder="SRV-PROD-DB02"
            required
          />
          <Input
            label="Modelo"
            name="model"
            icon="inventory_2"
            placeholder="Dell R750"
            required
          />
          <Input
            label="Número de serie"
            name="serial"
            icon="qr_code"
            placeholder="SN: DL-992384-EU"
            required
          />
          <Input
            label="Dirección IP"
            name="ip"
            icon="lan"
            placeholder="10.240.12.85"
            required
          />
          <Input
            label="Segmento / VLAN"
            name="segment"
            icon="account_tree"
            placeholder="VLAN 120 PROD-DB"
          />
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="category"
              className="font-label-mono-xs text-label-mono-xs uppercase tracking-wider text-secondary"
            >
              Categoría
            </label>
            <select
              id="category"
              name="category"
              defaultValue="physical"
              className="rounded-xl border border-surface-variant bg-surface-container-lowest px-4 py-2.5 font-body-md text-body-md text-on-surface focus:border-primary-container focus:outline-none focus:ring-2 focus:ring-primary-container/20"
            >
              <option value="physical">Físico</option>
              <option value="virtual">Virtual</option>
              <option value="cloud">Cloud</option>
            </select>
          </div>
        </div>
      </Card>

      <Card className="p-5 sm:p-6">
        <div className="mb-5 flex items-center gap-2">
          <Icon name="terminal" className="text-[20px] text-primary-container" />
          <h2 className="font-headline-sm text-headline-sm text-on-surface">
            Sistema y responsable
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Sistema operativo"
            name="os"
            icon="terminal"
            placeholder="Debian 12 Bookworm"
            required
          />
          <Input
            label="Responsable asignado"
            name="owner"
            icon="person"
            placeholder="Alejandro Ramos"
            required
          />
          <Input
            label="Especificaciones"
            name="specs"
            icon="memory"
            placeholder="64 vCPU // 256GB ECC // 4TB NVMe"
            containerClassName="sm:col-span-2"
          />
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label
              htmlFor="notes"
              className="font-label-mono-xs text-label-mono-xs uppercase tracking-wider text-secondary"
            >
              Notas de registro
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              placeholder="Rack, ubicación física, observaciones de seguridad..."
              className="resize-none rounded-xl border border-surface-variant bg-surface-container-lowest px-4 py-2.5 font-body-md text-body-md text-on-surface placeholder:text-secondary/80 focus:border-primary-container focus:outline-none focus:ring-2 focus:ring-primary-container/20"
            />
          </div>
        </div>
      </Card>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Link
          href="/inventory"
          className={cn(buttonStyles("secondary", "md"), "rounded-xl")}
        >
          Cancelar
        </Link>
        <Button
          type="submit"
          disabled={loading}
          className="rounded-xl py-2.5"
        >
          {loading ? (
            <>
              <Icon
                name="progress_activity"
                className="animate-spin text-[18px]"
              />
              <span>Registrando activo...</span>
            </>
          ) : (
            <>
              <Icon name="save" className="text-[18px]" />
              <span>Guardar activo</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
