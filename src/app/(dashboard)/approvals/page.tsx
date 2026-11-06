import type { Metadata } from "next";
import { ApprovalWorkspace } from "@/components/approvals/ApprovalWorkspace";

export const metadata: Metadata = {
  title: "Aprobación de Actualizaciones",
};

export default function ApprovalsPage() {
  return <ApprovalWorkspace />;
}
