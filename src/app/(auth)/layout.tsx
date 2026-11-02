import type { ReactNode } from "react";
import { AuthBrandPanel } from "@/components/layout/AuthBrandPanel";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen bg-surface lg:grid-cols-2">
      <AuthBrandPanel />
      <main className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-8 lg:px-12">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
