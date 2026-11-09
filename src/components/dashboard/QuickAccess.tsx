'use client'
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { useEffect, useState } from "react";
import { Equipo, Licencia, Notificacion, Page, Software, SolicitudActualizacion, Usuario } from "@/types/api";
import { equipmentService } from "@/lib/equipmentService";
import { softwareService } from "@/lib/softwareService";
import { approvalService } from "@/lib/approvalService";
import { licenseService } from "@/lib/licenseService";
import { notificationService } from "@/lib/notificationService";
import { securityService } from "@/lib/securityService";


export function QuickAccess() {
  const [equipos, setEquipos] = useState<Equipo[]>([])
  const [software, setSoftware] = useState<Software[]>([])
  const [solicitudes, setSolicitudes] = useState<SolicitudActualizacion[]>([])
  const [licencias, setLicencias] = useState<Licencia[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])
  const [loading, setLoading] = useState(false)

  const load = async () => {
    try {
      setLoading(true);

      // 1. Obtenemos todos los datos de las APIs en paralelo para mayor velocidad
      const [
        resEquipos,
        resSoftware,
        resSolicitudes,
        resLicencias,
        resUsuarios,
        resNotificaciones
      ] = await Promise.all([
        equipmentService.listEquipos(),
        softwareService.listSoftware(),
        approvalService.listSolicitudes(),
        licenseService.listLicencias(),
        securityService.listUsuarios(),
        notificationService.listNotificaciones()
      ]);

      // 2. Actualizamos los estados con los contenidos reales
      setEquipos(resEquipos.content || []);
      setSoftware(resSoftware.content || []);
      setSolicitudes(resSolicitudes.content || []);
      setLicencias(resLicencias.content || []);
      setUsuarios(resUsuarios.content || []);
      setNotificaciones(resNotificaciones.content || []);

    } catch (error) {
      console.error("Error al cargar los datos del dashboard:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load()

  }, [])

  const modules = [
    {
      href: "/inventory",
      icon: "devices",
      title: "Inventario de Activos",
      description: "Servidores, PC, Laptops, Virtuales y Cloud",
      metric: equipos.length,
    },
    {
      href: "/software",
      icon: "system_update_alt",
      title: "Software y Parches",
      description: "Software instalado en sus equipos y listos para pogramar despliegues.",
      metric: software.length,
    },
    {
      href: "/approvals",
      icon: "verified_user",
      title: "Centro de Actualizaciones",
      description: "Solicitudes cambios actualizacion.",
      metric: solicitudes.length,
    },
    {
      href: "/licenses",
      icon: "key",
      title: "Gestión de Licencias",
      description: "Renovaciones y manejo de disponibilidad.",
      metric: licencias.length,
    },
    {
      href: "/users",
      icon: "group",
      title: "Usuarios y Roles",
      description: "Altas, bajas y permisos del equipo de operación.",
      metric: usuarios.length,
    },
    {
      href: "/notifications",
      icon: "notifications_active",
      title: "Alertas & CVEs",
      description: "Centro alertas que afectan su equipo.",
      metric: notificaciones.length,
    },
  ];

  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-headline-sm text-headline-sm text-on-surface">
          Accesos Rápidos
        </h2>
        <span className="font-label-mono-xs text-label-mono-xs uppercase tracking-wider text-secondary">
          Módulos del ERP
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {modules.map((module) => (
          <Link key={module.href} href={module.href} className="group">
            <Card className="flex h-full items-start gap-space-md p-4 transition-all group-hover:-translate-y-0.5 group-hover:shadow-md">
              <div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-surface-container text-on-surface">
                <Icon name={module.icon} className="text-[21px]" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-title-md text-title-md text-on-surface">
                    {module.title}
                  </span>
                  <span className="font-label-mono-sm text-label-mono-sm text-primary-container">
                    {module.metric}
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-secondary">
                  {module.description}
                </p>
              </div>
              <Icon
                name="arrow_forward"
                className="mt-1 text-[18px] text-secondary transition-transform group-hover:translate-x-0.5 group-hover:text-primary-container"
              />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
