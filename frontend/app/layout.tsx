import { Metadata } from "next";
import "@/styles/login.css";
import "@/styles/globals.css";
import "@/styles/sidebar.css"
import Sidebar from "./components/Sidebar";
import JWT from "./jwt";
import { HeroUIProvider } from "@heroui/system";

export const metadata: Metadata = {
    title: "Webprojekt",
    description: "Abgabe DHBW",
};
export default function RootLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
      <html lang="en">
        <body>
        <HeroUIProvider>
          <JWT />
          <Sidebar />
          <main>{children}</main>
        </HeroUIProvider>
        </body>
      </html>
    );
}