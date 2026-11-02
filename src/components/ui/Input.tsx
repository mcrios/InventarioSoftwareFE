import type { InputHTMLAttributes, ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: string;
  hint?: string;
  error?: string;
  rightSlot?: ReactNode;
  containerClassName?: string;
}

export function Input({
  label,
  icon,
  hint,
  error,
  rightSlot,
  id,
  name,
  className,
  containerClassName,
  ...props
}: InputProps) {
  const inputId = id ?? name;

  return (
    <div className={cn("flex flex-col gap-1.5", containerClassName)}>
      {label ? (
        <label
          htmlFor={inputId}
          className="font-label-mono-xs text-label-mono-xs uppercase tracking-wider text-secondary"
        >
          {label}
        </label>
      ) : null}
      <div className="relative">
        {icon ? (
          <Icon
            name={icon}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[19px] text-secondary"
          />
        ) : null}
        <input
          id={inputId}
          name={name}
          aria-invalid={Boolean(error)}
          className={cn(
            "w-full rounded-xl border border-surface-variant bg-surface-container-lowest py-2.5 text-body-md text-on-surface placeholder:text-secondary/80 focus:border-primary-container focus:outline-none focus:ring-2 focus:ring-primary-container/20",
            icon ? "pl-10" : "pl-4",
            rightSlot ? "pr-11" : "pr-4",
            error && "border-error focus:border-error focus:ring-error/20",
            className,
          )}
          {...props}
        />
        {rightSlot ? (
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
            {rightSlot}
          </div>
        ) : null}
      </div>
      {error ? (
        <span className="font-label-mono-xs text-label-mono-xs text-error">
          {error}
        </span>
      ) : hint ? (
        <span className="font-label-mono-xs text-label-mono-xs text-secondary">
          {hint}
        </span>
      ) : null}
    </div>
  );
}
