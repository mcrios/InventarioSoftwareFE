import { cn } from "@/lib/utils";

interface IconProps {
  name: string;
  className?: string;
  filled?: boolean;
}

export function Icon({ name, className, filled = false }: IconProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "material-symbols-outlined select-none",
        filled && "material-symbols-filled",
        className,
      )}
    >
      {name}
    </span>
  );
}
