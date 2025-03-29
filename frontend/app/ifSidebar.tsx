"use client";
import { usePathname } from "next/navigation";
import Sidebar from "./components/Sidebar";

console.log("Geh doch alter")

export default function ConditionalSidebar() {
  const pathname = usePathname();

  if (pathname && pathname.includes("workspace")) return null;

  return <Sidebar />;
}
