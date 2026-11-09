"use client";

import { useEffect, useMemo, useState } from "react";
import { getAccessPathsFromUsuario } from "@/lib/access";
import {
  getCurrentUserSnapshot,
  getSessionEmail,
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
  /** Correo del usuario; usa el claim del JWT si el perfil aún no cargó. */
  email: string | null;
  /** Rutas de los accesos que otorgan los roles del usuario. */
  accessPaths: string[];
  /** `true` cuando ya se intentó resolver la sesión (con o sin éxito). */
  ready: boolean;
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
 * contra el backend si todavía no existe en la caché. Mientras el perfil no
 * esté disponible, `email` cae al claim del JWT para no perder la identidad.
 */
export function useSessionUser(): SessionUser {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    function sync() {
      if (!active) return;

      setUsuario(getCurrentUserSnapshot());
      setSessionEmail(getSessionEmail());
    }

    sync();

    const unsubscribe = subscribeToCurrentUser(sync);

    resolveCurrentUser()
      .then((resolved) => {
        if (!active) return;

        setUsuario(resolved);

        if (resolved?.email) {
          setSessionEmail(resolved.email);
        }
      })
      .catch(() => {
        // Si la consulta falla se conserva lo que haya en la caché.
      })
      .finally(() => {
        if (active) {
          setReady(true);
        }
      });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return useMemo(() => {
    const nombre = usuario?.nombre?.trim() ?? "";
    const role = usuario?.roles?.[0]?.nombre?.trim() || "Sesión";
    const email = usuario?.email ?? sessionEmail ?? null;

    return {
      usuario,
      name: nombre ? getShortName(nombre) : "Cuenta",
      fullName: nombre || "Cuenta",
      initials: nombre ? getInitials(nombre) : "US",
      role,
      email,
      accessPaths: getAccessPathsFromUsuario(usuario),
      ready,
    };
  }, [usuario, sessionEmail, ready]);
}
