import Link from "next/link";
import { useState } from "react";
import { FileText, Star, Settings, MessageSquare, UploadCloud, ChevronLeft, ChevronRight, Home, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export function AdminSidebar() {
    const [publishStatus, setPublishStatus] = useState<string | null>(null);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [notification, setNotification] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);

    async function handlePublish() {
        const msg = prompt("Enter commit message for publish:");
        if (!msg) return;

        setPublishStatus("Publishing...");
        setNotification({ type: "info", message: "Starting deployment..." });
        
        try {
            const res = await fetch("/api/admin/publish", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: msg }),
            });
            
            const data = await res.json();
            if (res.ok) {
                setNotification({ type: "success", message: "Published successfully! It will take a minute to go live." });
            } else {
                setNotification({ type: "error", message: "Error: " + (data.error || "Unknown") });
            }
        } catch (e) {
            setNotification({ type: "error", message: "Failed to publish." });
        }
        
        setPublishStatus(null);
        // Hide notification after 10 seconds
        setTimeout(() => setNotification(null), 10000);
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
                <Link href="/admin/config" className="btn" style={{ justifyContent: isCollapsed ? "center" : "flex-start" }} title="Site Settings">
                    <Settings size={18} />
                    {!isCollapsed && <span style={{ marginLeft: 10 }}>Site Settings</span>}
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

            {notification && (
                <div className="toast-container">
                    <div className={`toast ${notification.type}`}>
                        {notification.type === "success" && <CheckCircle size={18} color="#10b981" />}
                        {notification.type === "error" && <AlertCircle size={18} color="#ef4444" />}
                        {notification.type === "info" && <Loader2 size={18} className="animate-spin" />}
                        <span>{notification.message}</span>
                    </div>
                </div>
            )}
        </aside>
    );
}
