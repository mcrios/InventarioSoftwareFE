"use client";

import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Eliminar",
  loading = false,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={loading}>
            <Icon
              name={loading ? "progress_activity" : "delete"}
              className={loading ? "animate-spin text-[17px]" : "text-[17px]"}
            />
            <span>{loading ? "Eliminando..." : confirmLabel}</span>
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3 rounded-xl bg-error-container px-4 py-3 text-on-error-container">
        <Icon name="warning" className="text-[20px]" filled />
        <p className="font-body-sm text-body-sm">
          Esta acción es permanente y podría fallar si el registro todavía está
          relacionado con otros datos.
        </p>
      </div>
    </Modal>
  );
}
