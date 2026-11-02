"use client";

import { useState, type ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";

interface DashboardShellProps {
  children: ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="min-h-screen lg:pl-64">
        <Header onOpenSidebar={() => setSidebarOpen(true)} />
        <main className="w-full bg-surface px-space-md pb-space-xl pt-14 sm:px-space-lg">
          <div className="mx-auto w-full max-w-[1600px] pt-space-lg">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
