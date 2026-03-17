"use client";

import { useState, useEffect } from "react";

type FavoriteItem = { title: string; subtitle: string; cover: string; url: string; };
type Favorites = Record<string, FavoriteItem[]>;

export default function AdminFavoritesPage() {
    const [favs, setFavs] = useState<Favorites | null>(null);
    const [saving, setSaving] = useState(false);
    const [fetchingCovers, setFetchingCovers] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFavs();
    }, []);

    async function loadFavs() {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/favorites");
            const data = await res.json();
            setFavs(data.parsed || null);
        } catch (e) {
            alert("Error loading favorites");
        }
        setLoading(false);
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch("/api/admin/favorites", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ parsed: favs })
            });
            if (!res.ok) throw new Error("Failed to save");
            alert("Saved successfully.");
        } catch (e: any) {
            alert(e.message);
        }
        setSaving(false);
    }

    async function handleFetchCovers() {
        setFetchingCovers(true);
        try {
            const res = await fetch("/api/admin/favorites/fetch-covers", { method: "POST" });
            const data = await res.json();
            if (res.ok) {
                alert("Cover fetcher finished.\n\n" + (data.stdout || "No output."));
                await loadFavs();
            } else {
                alert("Error fetching covers: " + (data.error || "Unknown"));
            }
        } catch (e) {
            alert("Failed to run cover fetcher.");
        }
        setFetchingCovers(false);
    }

    async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>, category: string, idx: number) {
        if (!e.target.files?.[0]) return;
        
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", "favorite");

        try {
            const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
            const data = await res.json();
            
            if (res.ok) {
                if (favs) {
                    const newFavs = { ...favs };
                    newFavs[category][idx].cover = data.url;
                    setFavs(newFavs);
                }
            } else {
                alert("Upload failed: " + data.error);
            }
        } catch (err) {
            alert("Upload failed.");
        }
        e.target.value = '';
    }

    function updateItem(category: string, idx: number, field: keyof FavoriteItem, value: string) {
        if (!favs) return;
        const newFavs = { ...favs };
        newFavs[category][idx][field] = value;
        setFavs(newFavs);
    }

    function addItem(category: string) {
        if (!favs) return;
        const newFavs = { ...favs };
        newFavs[category].push({ title: "", subtitle: "", cover: "", url: "" });
        setFavs(newFavs);
    }

    function removeItem(category: string, idx: number) {
        if (!favs) return;
        if (!confirm("Remove this item?")) return;
        const newFavs = { ...favs };
        newFavs[category].splice(idx, 1);
        setFavs(newFavs);
    }

    if (loading) return <div>Loading...</div>;
    if (!favs) return <div>Failed to load favorites structural data.</div>;

    const inputStyle = { width: "100%", padding: "8px", marginBottom: "10px", borderRadius: "4px", border: "1px solid var(--border-color)", background: "var(--bg-secondary)", color: "var(--fg-primary)", fontSize: "14px" };

    return (
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h1>Manage Favorites</h1>
                <div style={{ display: "flex", gap: 10 }}>
                    <button className="btn" onClick={handleFetchCovers} disabled={fetchingCovers}>
                        {fetchingCovers ? "Fetching..." : "Auto-Fetch Missing Covers"}
                    </button>
                    <button onClick={handleSave} className="btn" disabled={saving}>
                        {saving ? "Saving..." : "Save Favorites"}
                    </button>
                </div>
            </div>

            <p style={{ opacity: 0.7, marginBottom: 30 }}>
                Edit your `favorites.md` visually. Click "Auto-Fetch Missing Covers" to run the scraper script, or upload covers per item.
            </p>

            {Object.keys(favs).map((category) => (
                <div key={category} style={{ marginBottom: 50 }}>
                    <h2 style={{ textTransform: "capitalize", marginBottom: 20, borderBottom: "1px solid var(--border-color)", paddingBottom: 10 }}>
                        {category}
                    </h2>
                    
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                        {favs[category].map((item, idx) => (
                            <div key={idx} style={{ padding: 15, border: "1px solid var(--border-color)", borderRadius: 8, background: "rgba(0,0,0,0.1)" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                                    <strong>Item #{idx + 1}</strong>
                                    <button type="button" onClick={() => removeItem(category, idx)} style={{ color: "red", background: "none", border: "none", cursor: "pointer" }}>Remove</button>
                                </div>
                                <input placeholder="Title" value={item.title} onChange={e => updateItem(category, idx, "title", e.target.value)} style={inputStyle} />
                                <input placeholder="Subtitle (Author, Artist, etc)" value={item.subtitle} onChange={e => updateItem(category, idx, "subtitle", e.target.value)} style={inputStyle} />
                                <input placeholder="URL" value={item.url} onChange={e => updateItem(category, idx, "url", e.target.value)} style={inputStyle} />
                                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                                    <input placeholder="Cover URL" value={item.cover} onChange={e => updateItem(category, idx, "cover", e.target.value)} style={{...inputStyle, marginBottom: 0, flex: 1}} />
                                    <label className="btn" style={{ padding: "6px 12px", fontSize: "12px", cursor: "pointer", whiteSpace: "nowrap", margin: 0 }}>
                                        Upload
                                        <input type="file" hidden accept="image/*" onChange={(e) => handleCoverUpload(e, category, idx)} />
                                    </label>
                                </div>
                                {item.cover && <img src={item.cover} alt="Cover preview" style={{ width: "100%", maxHeight: 150, objectFit: "contain", marginTop: 10, borderRadius: 4, background: "#000" }} />}
                            </div>
                        ))}
                    </div>

                    <button type="button" onClick={() => addItem(category)} className="btn" style={{ marginTop: 20 }}>
                        + Add {category}
                    </button>
                </div>
            ))}
            
            <div style={{ marginTop: 40, borderTop: "1px solid var(--border-color)", paddingTop: 20, textAlign: "right" }}>
                <button onClick={handleSave} className="btn" disabled={saving} style={{ fontSize: 16, padding: "10px 20px" }}>
                    {saving ? "Saving..." : "Save All Favorites"}
                </button>
            </div>
        </div>
    );
}
