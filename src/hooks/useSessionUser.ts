"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getCurrentUserSnapshot,
  resolveCurrentUser,
  subscribeToCurrentUser,
} from "@/lib/session";
import type { Usuario } from "@/types/api";

export interface SessionUser {
  usuario: Usuario | null;
  /** Nombre corto para la barra lateral, p. ej. "Mauricio C.". */
  name: string;
  fullName: string;
  initials: string;
  role: string;
  email: string | null;
}

function getInitials(nombre: string) {
  const initials = nombre
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return initials || "US";
}

function getShortName(nombre: string) {
  const parts = nombre.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return "Cuenta";
  if (parts.length === 1) return parts[0];

  return `${parts[0]} ${parts[parts.length - 1].charAt(0).toUpperCase()}.`;
}

/**
 * Expone el usuario de la sesión cacheado al iniciar sesión.
 *
 * Lee primero `localStorage` (sin llamar a la API) y solo resuelve el usuario
 * contra el backend si todavía no existe en la caché.
 */
export function useSessionUser(): SessionUser {
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useEffect(() => {
    let active = true;

    function sync() {
      if (active) {
        setUsuario(getCurrentUserSnapshot());
      }
    }

    sync();

    const unsubscribe = subscribeToCurrentUser(sync);

    resolveCurrentUser()
      .then((resolved) => {
        if (active) {
          setUsuario(resolved);
        }
      })
      .catch(() => {
        // Si la consulta falla se conserva lo que haya en la caché.
      });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return useMemo(() => {
    const nombre = usuario?.nombre?.trim() ?? "";
    const role = usuario?.roles?.[0]?.nombre?.trim() || "Sesión";

    return {
      usuario,
      name: nombre ? getShortName(nombre) : "Cuenta",
      fullName: nombre || "Cuenta",
      initials: nombre ? getInitials(nombre) : "US",
      role,
      email: usuario?.email ?? null,
    };
  }, [usuario]);
}
