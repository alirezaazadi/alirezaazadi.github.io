import Link from "next/link";
import { useState } from "react";
import { FileText, Star, User, MessageSquare, UploadCloud, ChevronLeft, ChevronRight, Home } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export function AdminSidebar() {
    const [publishStatus, setPublishStatus] = useState<string | null>(null);
    const [isCollapsed, setIsCollapsed] = useState(false);

    async function handlePublish() {
        const msg = prompt("Enter commit message for publish:");
        if (!msg) return;

        setPublishStatus("Publishing...");
        try {
            const res = await fetch("/api/admin/publish", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: msg }),
            });
            
            const data = await res.json();
            if (res.ok) {
                alert("Published successfully!");
            } else {
                alert("Error: " + (data.error || "Unknown"));
            }
        } catch (e) {
            alert("Failed to publish.");
        }
        setPublishStatus(null);
    }

    return (
        <aside style={{ width: isCollapsed ? 80 : 250, borderRight: "1px solid var(--border-color)", padding: isCollapsed ? "20px 10px" : 20, display: "flex", flexDirection: "column", height: "100vh", position: "sticky", top: 0, transition: "width 0.2s" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                {!isCollapsed && <h2>Blog Admin</h2>}
                {isCollapsed && <h2 style={{ fontSize: 14, margin: "0 auto" }}>CMS</h2>}
                <button onClick={() => setIsCollapsed(!isCollapsed)} style={{ background: "transparent", border: "none", color: "var(--fg-primary)", cursor: "pointer", padding: 4 }}>
                    {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
            </div>
            
            <nav style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
                <Link href="/admin/posts" className="btn" style={{ justifyContent: isCollapsed ? "center" : "flex-start" }} title="Posts">
                    <FileText size={18} />
                    {!isCollapsed && <span style={{ marginLeft: 10 }}>Posts</span>}
                </Link>
                <Link href="/admin/favorites" className="btn" style={{ justifyContent: isCollapsed ? "center" : "flex-start" }} title="Favorites">
                    <Star size={18} />
                    {!isCollapsed && <span style={{ marginLeft: 10 }}>Favorites</span>}
                </Link>
                <Link href="/admin/config" className="btn" style={{ justifyContent: isCollapsed ? "center" : "flex-start" }} title="About / Contact">
                    <User size={18} />
                    {!isCollapsed && <span style={{ marginLeft: 10 }}>About / Contact</span>}
                </Link>
                <Link href="/admin/suggestions" className="btn" style={{ justifyContent: isCollapsed ? "center" : "flex-start" }} title="Suggestions">
                    <MessageSquare size={18} />
                    {!isCollapsed && <span style={{ marginLeft: 10 }}>Suggestions</span>}
                </Link>
                <Link href="/" className="btn" style={{ marginTop: 20, opacity: 0.7, justifyContent: isCollapsed ? "center" : "flex-start" }} title="Back to Site">
                    <Home size={18} />
                    {!isCollapsed && <span style={{ marginLeft: 10 }}>Back to Site</span>}
                </Link>
            </nav>
            <div style={{ marginTop: "auto", paddingTop: 20, borderTop: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
                <div style={{ alignSelf: isCollapsed ? "center" : "flex-start" }}>
                    <ThemeToggle />
                </div>
                <button 
                    className="btn" 
                    onClick={handlePublish}
                    disabled={!!publishStatus}
                    style={{ width: "100%", justifyContent: "center" }}
                    title="Deploy / Publish"
                >
                    {isCollapsed ? <UploadCloud size={18} /> : (publishStatus || "Deploy / Publish")}
                </button>
            </div>
        </aside>
    );
}
