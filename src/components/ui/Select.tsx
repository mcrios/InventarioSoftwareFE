"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

type SelectSize = "sm" | "md";

interface DropdownPosition {
  left: number;
  width: number;
  top?: number;
  bottom?: number;
  maxHeight: number;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  label?: string;
  hint?: string;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  /** Muestra el buscador dentro del desplegable. Por defecto si hay más de 6 opciones. */
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
  size?: SelectSize;
  id?: string;
  required?: boolean;
  ariaLabel?: string;
  containerClassName?: string;
  className?: string;
}

const sizeClasses: Record<SelectSize, string> = {
  sm: "gap-1.5 rounded-lg px-2.5 py-1.5 font-label-mono-xs text-label-mono-xs",
  md: "gap-2 rounded-xl px-3.5 py-2.5 font-body-md text-body-md",
};

export function Select({
  value,
  onChange,
  options,
  label,
  hint,
  error,
  placeholder = "Selecciona una opción",
  disabled = false,
  searchable,
  searchPlaceholder = "Escribir para buscar...",
  emptyMessage = "Sin coincidencias",
  size = "md",
  id,
  required = false,
  ariaLabel,
  containerClassName,
  className,
}: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const listId = `${selectId}-listbox`;

  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlighted, setHighlighted] = useState(0);
  const [position, setPosition] = useState<DropdownPosition | null>(null);

  const selected = useMemo(
    () => options.find((option) => option.value === value) ?? null,
    [options, value],
  );

  const showSearch = searchable ?? options.length > 6;

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();

    if (!term) return options;

    return options.filter((option) =>
      [option.label, option.description ?? "", option.value]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [options, query]);

  const updatePosition = useCallback(() => {
    const element = triggerRef.current;

    if (!element) return;

    const rect = element.getBoundingClientRect();
    const margin = 8;
    const desired = 300;
    const spaceBelow = window.innerHeight - rect.bottom - margin;
    const spaceAbove = rect.top - margin;
    const openAbove =
      spaceBelow < Math.min(desired, 180) && spaceAbove > spaceBelow;
    const width = Math.max(rect.width, 230);
    const left = Math.min(
      Math.max(margin, rect.left),
      Math.max(margin, window.innerWidth - width - margin),
    );

    setPosition({
      left,
      width,
      top: openAbove ? undefined : rect.bottom + 6,
      bottom: openAbove ? window.innerHeight - rect.top + 6 : undefined,
      maxHeight: Math.max(
        150,
        Math.min(desired, (openAbove ? spaceAbove : spaceBelow) - 6),
      ),
    });
  }, []);

  useEffect(() => {
    if (!open) return;

    updatePosition();

    function handleViewportChange() {
      updatePosition();
    }

    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);

    return () => {
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;

      if (triggerRef.current?.contains(target)) return;
      if (dropdownRef.current?.contains(target)) return;

      setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  useEffect(() => {
    if (!open || !showSearch) return;

    const timer = window.setTimeout(() => searchRef.current?.focus(), 0);

    return () => window.clearTimeout(timer);
  }, [open, showSearch]);

  useEffect(() => {
    if (!open) return;

    const element = listRef.current?.querySelector<HTMLElement>(
      `[data-index="${highlighted}"]`,
    );

    element?.scrollIntoView({ block: "nearest" });
  }, [highlighted, open]);

  function openDropdown() {
    setQuery("");
    const index = options.findIndex((option) => option.value === value);
    setHighlighted(index < 0 ? 0 : index);
    setOpen(true);
    updatePosition();
  }

  function toggle() {
    if (disabled) return;

    if (open) {
      setOpen(false);
    } else {
      openDropdown();
    }
  }

  function selectOption(option: SelectOption) {
    if (option.disabled) return;

    onChange(option.value);
    setOpen(false);
    setQuery("");
    triggerRef.current?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") {
      if (!open) return;

      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
      return;
    }

    if (!open) {
      if (
        event.key === "ArrowDown" ||
        event.key === "ArrowUp" ||
        event.key === "Enter"
      ) {
        event.preventDefault();
        openDropdown();
      }

      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlighted((current) =>
        Math.min(current + 1, Math.max(filtered.length - 1, 0)),
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlighted((current) => Math.max(current - 1, 0));
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const option = filtered[highlighted];

      if (option) selectOption(option);
    }
  }

  function handleQueryChange(text: string) {
    setQuery(text);
    setHighlighted(0);
  }

  const dropdown =
    typeof document !== "undefined" && open && position
      ? createPortal(
          <div
            ref={dropdownRef}
            id={listId}
            role="listbox"
            aria-label={ariaLabel ?? label}
            style={{
              position: "fixed",
              left: position.left,
              width: position.width,
              top: position.top,
              bottom: position.bottom,
              maxHeight: position.maxHeight,
            }}
            className="z-[100] flex flex-col overflow-hidden rounded-xl border border-surface-variant bg-surface-container-lowest shadow-[0_18px_48px_rgba(0,0,0,0.22)]"
          >
            {showSearch ? (
              <div className="flex shrink-0 items-center gap-2 border-b border-surface-variant px-3 py-2">
                <Icon name="search" className="text-[18px] text-secondary" />
                <input
                  ref={searchRef}
                  type="text"
                  value={query}
                  onChange={(event) => handleQueryChange(event.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={searchPlaceholder}
                  aria-label="Buscar opción"
                  className="w-full bg-transparent font-body-sm text-body-sm text-on-surface placeholder:text-secondary focus:outline-none"
                />
                {query ? (
                  <button
                    type="button"
                    onClick={() => handleQueryChange("")}
                    aria-label="Limpiar búsqueda"
                    className="rounded p-0.5 text-secondary transition-colors hover:text-on-surface"
                  >
                    <Icon name="close" className="text-[16px]" />
                  </button>
                ) : null}
              </div>
            ) : null}

            <ul
              ref={listRef}
              className="min-h-0 flex-1 overflow-y-auto p-1.5"
            >
              {filtered.length ? (
                filtered.map((option, index) => {
                  const isSelected = option.value === value;
                  const isHighlighted = index === highlighted;

                  return (
                    <li key={option.value}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        disabled={option.disabled}
                        data-index={index}
                        onMouseEnter={() => setHighlighted(index)}
                        onClick={() => selectOption(option)}
                        className={cn(
                          "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left transition-colors",
                          isHighlighted && "bg-surface-container",
                          isSelected && "font-semibold",
                          option.disabled && "cursor-not-allowed opacity-40",
                        )}
                      >
                        <span className="flex min-w-0 flex-col">
                          <span className="truncate font-body-sm text-body-sm text-on-surface">
                            {option.label}
                          </span>
                          {option.description ? (
                            <span className="truncate font-label-mono-xs text-label-mono-xs text-secondary">
                              {option.description}
                            </span>
                          ) : null}
                        </span>
                        {isSelected ? (
                          <Icon
                            name="check"
                            className="shrink-0 text-[17px] text-primary-container"
                          />
                        ) : null}
                      </button>
                    </li>
                  );
                })
              ) : (
                <li className="px-3 py-4 text-center font-body-sm text-body-sm text-secondary">
                  {emptyMessage}
                </li>
              )}
            </ul>
          </div>,
          document.body,
        )
      : null;

  return (
    <div className={cn("flex flex-col gap-1.5", containerClassName)}>
      {label ? (
        <label
          htmlFor={selectId}
          className="font-label-mono-xs text-label-mono-xs uppercase tracking-wider text-secondary"
        >
          {label}
        </label>
      ) : null}

      <button
        ref={triggerRef}
        id={selectId}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel ?? label}
        aria-required={required}
        aria-invalid={Boolean(error)}
        disabled={disabled}
        onClick={toggle}
        onKeyDown={handleKeyDown}
        className={cn(
          "flex w-full items-center justify-between border bg-surface-container-lowest text-left text-on-surface shadow-sm transition-colors",
          "focus:border-primary-container focus:outline-none focus:ring-2 focus:ring-primary-container/20",
          "hover:border-outline-variant disabled:cursor-not-allowed disabled:opacity-50",
          sizeClasses[size],
          error
            ? "border-error focus:border-error focus:ring-error/20"
            : "border-surface-variant",
          open && "border-primary-container ring-2 ring-primary-container/20",
          className,
        )}
      >
        <span
          className={cn(
            "truncate",
            selected ? "text-on-surface" : "text-secondary/80",
          )}
        >
          {selected?.label ?? placeholder}
        </span>
        <Icon
          name="expand_more"
          className={cn(
            "shrink-0 text-[20px] text-secondary transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {error ? (
        <span className="font-label-mono-xs text-label-mono-xs text-error">
          {error}
        </span>
      ) : hint ? (
        <span className="font-label-mono-xs text-label-mono-xs text-secondary">
          {hint}
        </span>
      ) : null}

      {dropdown}
    </div>
  );
}
