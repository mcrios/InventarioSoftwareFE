import type { Metadata } from "next";
import { ProfileWorkspace } from "@/components/settings/ProfileWorkspace";

export const metadata: Metadata = {
  title: "Mi Perfil",
};

export default function SettingsPage() {
  return <ProfileWorkspace />;
}
