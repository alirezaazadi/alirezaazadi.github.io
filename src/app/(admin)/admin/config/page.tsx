"use client";

import { useState, useEffect } from "react";
import { RichEditor } from "@/components/RichEditor";

export default function AdminConfigPage() {
    const [aboutMe, setAboutMe] = useState("");
    const [social, setSocial] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetch("/api/admin/config")
            .then(r => r.json())
            .then(data => {
                setAboutMe(data.aboutMe || "");
                setSocial(data.social || {});
                setLoading(false);
            })
            .catch(e => {
                alert("Failed to load config");
                setLoading(false);
            });
    }, []);

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch("/api/admin/config", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ aboutMe, social })
            });
            if (res.ok) {
                alert("Saved successfully!");
            } else {
                alert("Failed to save.");
            }
        } catch (e) {
            alert("Error saving config.");
        }
        setSaving(false);
    }

    function handleSocialChange(key: string, value: string) {
        setSocial(prev => ({ ...prev, [key]: value }));
    }

    function addSocialRow() {
        const key = prompt("Enter social network name (e.g. twitter):");
        if (key && !social[key]) {
            setSocial(prev => ({ ...prev, [key.toLowerCase()]: "" }));
        }
    }

    function removeSocialRow(key: string) {
        setSocial(prev => {
            const next = { ...prev };
            delete next[key];
            return next;
        });
    }

    if (loading) return <div>Loading...</div>;

    const inputStyle = { width: "100%", padding: "8px", marginBottom: "15px", borderRadius: "4px", border: "1px solid var(--border-color)", background: "var(--bg-secondary)", color: "var(--fg-primary)" };

    return (
        <form onSubmit={handleSave} style={{ maxWidth: 800, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h1>About & Contact</h1>
                <button type="submit" className="btn" disabled={saving}>
                    {saving ? "Saving..." : "Save Config"}
                </button>
            </div>

            <div style={{ marginBottom: 30 }}>
                <h2>Contact / Social Links</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 15 }}>
                    {Object.entries(social).map(([key, value]) => (
                        <div key={key} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                            <div style={{ width: 100, fontWeight: "bold" }}>{key}</div>
                            <input 
                                style={{ ...inputStyle, marginBottom: 0, flex: 1 }} 
                                value={value} 
                                onChange={e => handleSocialChange(key, e.target.value)} 
                                placeholder="https://..."
                            />
                            <button type="button" className="btn btn-small" onClick={() => removeSocialRow(key)} style={{ color: "red", borderColor: "red" }}>Remove</button>
                        </div>
                    ))}
                </div>
                <button type="button" className="btn" style={{ marginTop: 15 }} onClick={addSocialRow}>+ Add Link</button>
            </div>

            <hr style={{ margin: "30px 0", borderColor: "var(--border-color)", opacity: 0.2 }} />

            <div>
                <h2>About Me</h2>
                <RichEditor 
                    id="about-editor"
                    value={aboutMe}
                    onChange={setAboutMe}
                />
            </div>
        </form>
    );
}
