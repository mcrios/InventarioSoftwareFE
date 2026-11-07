import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "dark"
  | "link";

export type ButtonSize = "sm" | "md" | "icon";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary-container text-on-primary hover:opacity-95 shadow-sm active:scale-[0.98]",
  secondary:
    "bg-dark text-on-dark hover:bg-dark-hover shadow-sm active:scale-[0.98]",
  outline:
    "border border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container",
  ghost:
    "text-on-surface-variant hover:bg-surface-container hover:text-on-surface",
  danger: "bg-error text-on-error hover:opacity-95 shadow-sm",
  dark: "bg-dark text-on-dark hover:bg-dark-hover shadow-sm active:scale-[0.98]",
  link: "text-primary-container hover:underline",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "gap-1 px-3 py-1 rounded-lg text-body-sm",
  md: "gap-1.5 px-4 py-2 rounded-full text-body-sm",
  icon: "p-1.5 rounded-lg",
};

export function buttonStyles(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
) {
  return cn(
    "inline-flex items-center justify-center font-title-md transition-all disabled:opacity-40 disabled:pointer-events-none",
    variantClasses[variant],
    sizeClasses[size],
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonStyles(variant, size), className)}
      {...props}
    />
  );
}
