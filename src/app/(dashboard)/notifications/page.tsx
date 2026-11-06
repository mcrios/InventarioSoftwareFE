import type { Metadata } from "next";
import { NotificationWorkspace } from "@/components/notifications/NotificationWorkspace";

export const metadata: Metadata = {
  title: "Notificaciones",
};

export default function NotificationsPage() {
  return <NotificationWorkspace />;
}
