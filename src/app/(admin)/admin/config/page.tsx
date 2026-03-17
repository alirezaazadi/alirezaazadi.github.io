"use client";

import { useState, useEffect } from "react";
import { RichEditor } from "@/components/RichEditor";

const ALL_LANGUAGES = [
    { code: "English", label: "English" },
    { code: "French", label: "Français" },
    { code: "German", label: "Deutsch" },
    { code: "Spanish", label: "Español" },
    { code: "Arabic", label: "العربية" },
    { code: "Turkish", label: "Türkçe" },
    { code: "Persian", label: "فارسی" },
    { code: "Chinese", label: "中文" },
    { code: "Japanese", label: "日本語" },
    { code: "Korean", label: "한국어" },
    { code: "Russian", label: "Русский" },
    { code: "Portuguese", label: "Português" },
    { code: "Italian", label: "Italiano" },
    { code: "Dutch", label: "Nederlands" },
    { code: "Hindi", label: "हिन्दी" },
];

const ALL_SHARE_OPTIONS = [
    { id: "linkedin", label: "LinkedIn" },
    { id: "telegram", label: "Telegram" },
    { id: "copyLink", label: "Copy Link" },
];

const ALL_TERMINAL_COMMANDS = [
    { id: "help", label: "help — Show available commands" },
    { id: "ls", label: "ls — List directory contents" },
    { id: "cd", label: "cd — Change directory" },
    { id: "cat", label: "cat — Open a post / show file" },
    { id: "grep", label: "grep — Search posts by keyword" },
    { id: "favs", label: "favs — List favorites" },
    { id: "whoami", label: "whoami — Display user info" },
    { id: "clear", label: "clear — Clear terminal" },
    { id: "exit", label: "exit — Close terminal" },
];

const sectionStyle: React.CSSProperties = {
    marginBottom: 30,
    padding: "20px",
    background: "var(--bg-secondary)",
    borderRadius: "12px",
    border: "1px solid var(--border-color)",
};

const sectionTitleStyle: React.CSSProperties = {
    marginBottom: 15,
    fontSize: 16,
    fontFamily: "var(--font-mono)",
};

const checkboxLabelStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    cursor: "pointer",
    fontSize: 14,
};

const checkboxStyle: React.CSSProperties = {
    width: 18,
    height: 18,
    cursor: "pointer",
};

const chipGridStyle: React.CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
};

type Config = {
    description: string;
    aboutMe: string;
    social: Record<string, string>;
    showFavorites: boolean;
    showContact: boolean;
    showTranslation: boolean;
    showAdhdMode: boolean;
    showArchive: boolean;
    showShare: boolean;
    showSuggestions: boolean;
    showAbout: boolean;
    showTerminal: boolean;
    shareOptions: string[];
    terminalCommands: string[];
    translateLanguages: string[];
    defaultImageWidth: number;
};

function ToggleChip({ label, active, onToggle }: { label: string; active: boolean; onToggle: () => void }) {
    return (
        <button
            type="button"
            onClick={onToggle}
            className="btn"
            style={{
                padding: "4px 12px",
                fontSize: 13,
                background: active ? "var(--accent)" : "transparent",
                color: active ? "#fff" : "var(--text-secondary)",
                borderColor: active ? "var(--accent)" : "var(--border-color)",
            }}
        >
            {label}
        </button>
    );
}

export default function AdminConfigPage() {
    const [config, setConfig] = useState<Config | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetch("/api/admin/config")
            .then(r => r.json())
            .then(data => {
                setConfig({
                    description: data.description ?? "",
                    aboutMe: data.aboutMe ?? "",
                    social: data.social ?? {},
                    showFavorites: data.showFavorites ?? true,
                    showContact: data.showContact ?? true,
                    showTranslation: data.showTranslation ?? true,
                    showAdhdMode: data.showAdhdMode ?? true,
                    showArchive: data.showArchive ?? true,
                    showShare: data.showShare ?? true,
                    showSuggestions: data.showSuggestions ?? true,
                    showAbout: data.showAbout ?? true,
                    showTerminal: data.showTerminal ?? true,
                    shareOptions: data.shareOptions ?? ["linkedin", "telegram", "copyLink"],
                    terminalCommands: data.terminalCommands ?? ["help", "ls", "cd", "cat", "grep", "favs", "whoami", "clear", "exit"],
                    translateLanguages: data.translateLanguages ?? ALL_LANGUAGES.map(l => l.code),
                    defaultImageWidth: data.defaultImageWidth ?? 0,
                });
                setLoading(false);
            })
            .catch(() => {
                alert("Failed to load config");
                setLoading(false);
            });
    }, []);

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        if (!config) return;
        setSaving(true);
        try {
            const res = await fetch("/api/admin/config", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(config),
            });
            if (res.ok) {
                alert("Saved successfully!");
            } else {
                alert("Failed to save.");
            }
        } catch {
            alert("Error saving config.");
        }
        setSaving(false);
    }

    function set<K extends keyof Config>(key: K, value: Config[K]) {
        setConfig(prev => prev ? { ...prev, [key]: value } : prev);
    }

    function toggleArrayItem(key: "shareOptions" | "terminalCommands" | "translateLanguages", item: string) {
        setConfig(prev => {
            if (!prev) return prev;
            const arr = prev[key];
            return {
                ...prev,
                [key]: arr.includes(item) ? arr.filter(v => v !== item) : [...arr, item],
            };
        });
    }

    function handleSocialChange(key: string, value: string) {
        setConfig(prev => prev ? { ...prev, social: { ...prev.social, [key]: value } } : prev);
    }

    function addSocialRow() {
        const key = prompt("Enter social network name (e.g. twitter):");
        if (key && config && !config.social[key]) {
            set("social", { ...config.social, [key.toLowerCase()]: "" });
        }
    }

    function removeSocialRow(key: string) {
        setConfig(prev => {
            if (!prev) return prev;
            const next = { ...prev.social };
            delete next[key];
            return { ...prev, social: next };
        });
    }

    if (loading || !config) return <div>Loading...</div>;

    const inputStyle: React.CSSProperties = {
        width: "100%",
        padding: 8,
        borderRadius: 4,
        border: "1px solid var(--border-color)",
        background: "var(--bg-secondary)",
        color: "var(--fg-primary)",
        fontFamily: "var(--font-mono)",
        fontSize: 13,
    };

    return (
        <form onSubmit={handleSave} style={{ maxWidth: 800, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h1>Site Settings</h1>
                <button type="submit" className="btn" disabled={saving}>
                    {saving ? "Saving..." : "Save Config"}
                </button>
            </div>

            {/* Site Identity */}
            <div style={sectionStyle}>
                <h2 style={sectionTitleStyle}>Site Identity</h2>
                <label style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 6, display: "block" }}>
                    Subtitle / Tagline
                </label>
                <textarea
                    style={{ ...inputStyle, minHeight: 60, resize: "vertical", marginBottom: 0 }}
                    value={config.description}
                    onChange={e => set("description", e.target.value)}
                    placeholder="An observer, a sojourner..."
                    rows={2}
                />
            </div>

            {/* Blog Sections Visibility */}
            <div style={sectionStyle}>
                <h2 style={sectionTitleStyle}>Blog Sections</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <label style={checkboxLabelStyle}>
                        <input type="checkbox" checked={config.showFavorites} onChange={e => set("showFavorites", e.target.checked)} style={checkboxStyle} />
                        <span>Favorites Sidebar</span>
                    </label>
                    <label style={checkboxLabelStyle}>
                        <input type="checkbox" checked={config.showContact} onChange={e => set("showContact", e.target.checked)} style={checkboxStyle} />
                        <span>Contact Sidebar (About, Socials)</span>
                    </label>
                </div>
            </div>

            {/* Navigation */}
            <div style={sectionStyle}>
                <h2 style={sectionTitleStyle}>Navigation</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <label style={checkboxLabelStyle}>
                        <input type="checkbox" checked={config.showAbout} onChange={e => set("showAbout", e.target.checked)} style={checkboxStyle} />
                        <span>About page (header nav link)</span>
                    </label>
                    <label style={checkboxLabelStyle}>
                        <input type="checkbox" checked={config.showSuggestions} onChange={e => set("showSuggestions", e.target.checked)} style={checkboxStyle} />
                        <span>Suggestions page (header nav link)</span>
                    </label>
                    <label style={checkboxLabelStyle}>
                        <input type="checkbox" checked={config.showTerminal} onChange={e => set("showTerminal", e.target.checked)} style={checkboxStyle} />
                        <span>Terminal feature</span>
                    </label>
                </div>
            </div>

            {/* Post Features */}
            <div style={sectionStyle}>
                <h2 style={sectionTitleStyle}>Post Features</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <label style={checkboxLabelStyle}>
                        <input type="checkbox" checked={config.showTranslation} onChange={e => set("showTranslation", e.target.checked)} style={checkboxStyle} />
                        <span>Translation button</span>
                    </label>
                    <label style={checkboxLabelStyle}>
                        <input type="checkbox" checked={config.showAdhdMode} onChange={e => set("showAdhdMode", e.target.checked)} style={checkboxStyle} />
                        <span>ADHD / Reader mode</span>
                    </label>
                    <label style={checkboxLabelStyle}>
                        <input type="checkbox" checked={config.showShare} onChange={e => set("showShare", e.target.checked)} style={checkboxStyle} />
                        <span>Share button</span>
                    </label>
                    <label style={checkboxLabelStyle}>
                        <input type="checkbox" checked={config.showArchive} onChange={e => set("showArchive", e.target.checked)} style={checkboxStyle} />
                        <span>Archive button (web.archive.org)</span>
                    </label>
                </div>
            </div>

            {/* Translation Languages */}
            {config.showTranslation && (
                <div style={sectionStyle}>
                    <h2 style={sectionTitleStyle}>Translation Languages</h2>
                    <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>Select which languages appear in the translate picker.</p>
                    <div style={chipGridStyle}>
                        {ALL_LANGUAGES.map(lang => (
                            <ToggleChip
                                key={lang.code}
                                label={lang.label}
                                active={config.translateLanguages.includes(lang.code)}
                                onToggle={() => toggleArrayItem("translateLanguages", lang.code)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Share Options */}
            {config.showShare && (
                <div style={sectionStyle}>
                    <h2 style={sectionTitleStyle}>Share Options</h2>
                    <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>Select which share options are available.</p>
                    <div style={chipGridStyle}>
                        {ALL_SHARE_OPTIONS.map(opt => (
                            <ToggleChip
                                key={opt.id}
                                label={opt.label}
                                active={config.shareOptions.includes(opt.id)}
                                onToggle={() => toggleArrayItem("shareOptions", opt.id)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Terminal Commands */}
            {config.showTerminal && (
                <div style={sectionStyle}>
                    <h2 style={sectionTitleStyle}>Terminal Commands</h2>
                    <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>Select which terminal commands are enabled.</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {ALL_TERMINAL_COMMANDS.map(cmd => (
                            <label key={cmd.id} style={checkboxLabelStyle}>
                                <input
                                    type="checkbox"
                                    checked={config.terminalCommands.includes(cmd.id)}
                                    onChange={() => toggleArrayItem("terminalCommands", cmd.id)}
                                    style={checkboxStyle}
                                />
                                <span style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>{cmd.label}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}

            {/* Images */}
            <div style={sectionStyle}>
                <h2 style={sectionTitleStyle}>Images</h2>
                <label style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 6, display: "block" }}>
                    Default image max-width in posts (px). Set to 0 for no limit.
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                        type="number"
                        min={0}
                        style={{ ...inputStyle, width: 120 }}
                        value={config.defaultImageWidth}
                        onChange={e => set("defaultImageWidth", parseInt(e.target.value, 10) || 0)}
                    />
                    <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                        {config.defaultImageWidth === 0 ? "(unlimited)" : "px"}
                    </span>
                </div>
            </div>

            {/* Social Links */}
            <div style={sectionStyle}>
                <h2 style={sectionTitleStyle}>Contact / Social Links</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {Object.entries(config.social).map(([key, value]) => (
                        <div key={key} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                            <div style={{ width: 100, fontWeight: "bold", fontSize: 13, fontFamily: "var(--font-mono)" }}>{key}</div>
                            <input
                                style={{ ...inputStyle, flex: 1 }}
                                value={value}
                                onChange={e => handleSocialChange(key, e.target.value)}
                                placeholder="https://..."
                            />
                            <button type="button" className="btn" onClick={() => removeSocialRow(key)} style={{ color: "#ef4444", borderColor: "#ef4444", fontSize: 12 }}>
                                Remove
                            </button>
                        </div>
                    ))}
                </div>
                <button type="button" className="btn" style={{ marginTop: 15 }} onClick={addSocialRow}>+ Add Link</button>
            </div>

            <hr style={{ margin: "30px 0", borderColor: "var(--border-color)", opacity: 0.2 }} />

            {/* About Me */}
            <div>
                <h2>About Me</h2>
                <RichEditor
                    id="about-editor"
                    value={config.aboutMe}
                    onChange={v => set("aboutMe", v)}
                />
            </div>
        </form>
    );
}
