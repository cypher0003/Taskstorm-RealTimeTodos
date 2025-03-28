'use client'


import "@/styles/login.css";
import "@/styles/globals.css";
import "@/styles/sidebar.css";
import { HeroUIProvider } from "@heroui/system";
import { NextUIProvider } from "@nextui-org/react";
import ConditionalSidebar from "./ifSidebar";



export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en">
            <body>
                <NextUIProvider>
                    <ConditionalSidebar />
                    <main>{children}</main>
                </NextUIProvider>
            </body>
        </html>
    );
}
