import type { Metadata } from "next";
import { SoftwareWorkspace } from "@/components/software/SoftwareWorkspace";

export const metadata: Metadata = {
  title: "Software y Parches",
};

export default function SoftwarePage() {
  return <SoftwareWorkspace />;
}
