"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, buttonStyles } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { authService } from "@/lib/authService";

export function ErrorActions() {
  const router = useRouter();

  function handleLogout() {
    authService.logout();
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="mt-8 flex flex-col items-center justify-center gap-2 sm:flex-row">
      <Link href="/dashboard" className={buttonStyles("primary", "md")}>
        <Icon name="dashboard" className="text-[17px]" />
        <span>Volver al panel</span>
      </Link>
      <Button variant="outline" onClick={handleLogout}>
        <Icon name="logout" className="text-[17px]" />
        <span>Cerrar sesión</span>
      </Button>
    </div>
  );
}
