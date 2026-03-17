"use client";

import { useState, useEffect } from "react";

export default function AdminSuggestionsPage() {
    const slug = "suggestions"; // The post slug for suggestions
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // Frontmatter fields + content
    const [title, setTitle] = useState("");
    const [date, setDate] = useState("");
    const [content, setContent] = useState("");

    useEffect(() => {
        fetch(`/api/admin/posts/${slug}`)
            .then(r => r.json())
            .then(data => {
                if (data.error) {
                    alert(data.error);
                    return;
                }
                setTitle(data.title || "Suggestions");
                setDate(data.date || new Date().toISOString().split("T")[0]);
                setContent(data.content || "");
                setLoading(false);
            })
            .catch(e => {
                // If it doesn't exist yet, we'll just start empty.
                setTitle("Suggestions");
                setDate(new Date().toISOString().split("T")[0]);
                setContent("");
                setLoading(false);
            });
    }, []);

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        
        const payload = {
            slug,
            title,
            date,
            summary: "Music and suggestions to myself",
            categories: ["suggestions"],
            content
        };

        try {
            // Use the PUT method to update the post
            const res = await fetch(`/api/admin/posts/${slug}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            
            if (res.ok) {
                alert("Suggestions saved successfully.");
            } else {
                // If the post didn't exist at all, PUT might fail if the file doesn't exist, wait no, PUT creates it.
                // Let's check API. Ah, fs.writeFile creates the file if it doesn't exist, so PUT is safe for new files too.
                alert("Error: " + data.error);
            }
        } catch (e: any) {
            alert("Failed to save suggestions.");
        }
        setSaving(false);
    }

    if (loading) return <div>Loading...</div>;

    const inputStyle = { width: "100%", padding: "8px", marginBottom: "15px", borderRadius: "4px", border: "1px solid var(--border-color)", background: "var(--bg-secondary)", color: "var(--fg-primary)" };

    return (
        <form onSubmit={handleSave} style={{ maxWidth: 800, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h1>Manage Suggestions</h1>
                <button type="submit" className="btn" disabled={saving}>
                    {saving ? "Saving..." : "Save Suggestions"}
                </button>
            </div>

            <p style={{ opacity: 0.7, marginBottom: 20 }}>
                This edits the `content/posts/suggestions.md` file, which powers the /suggestions page. Markdown is fully supported.
            </p>

            <textarea 
                style={{ ...inputStyle, minHeight: 600, fontFamily: "monospace", fontSize: 14 }} 
                required 
                value={content} 
                onChange={e => setContent(e.target.value)} 
                placeholder="Write your markdown here..."
            />
        </form>
    );
}
