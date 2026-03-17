"use client";

import { AdminSidebar } from "./Sidebar";
import { useEffect } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // Prevent body from scrolling behind the fixed full-screen admin
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, []);

    return (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 9999, display: "flex", background: "var(--bg-primary)", color: "var(--fg-primary)" }}>
            <AdminSidebar />
            <main style={{ flex: 1, padding: 40, overflowY: "auto", height: "100vh" }}>
                {children}
            </main>
        </div>
    );
}
