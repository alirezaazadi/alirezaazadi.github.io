"use client";

import { useState, useEffect } from "react";
import { Book, Music, Podcast, Youtube, ListMusic, ChevronDown, ChevronRight, X } from "lucide-react";

interface FavoriteItem {
    title: string;
    subtitle: string;
    cover: string;
    url: string;
}

interface Favorites {
    books: FavoriteItem[];
    music: FavoriteItem[];
    podcasts: FavoriteItem[];
    youtube: FavoriteItem[];
    playlists: FavoriteItem[];
}

interface FavoritesSidebarProps {
    favorites: Favorites | null;
}

const STORAGE_KEY = "blog-preferences";

const sectionConfig = [
    { key: "books" as const, label: "Reading", icon: <Book size={14} /> },
    { key: "music" as const, label: "Listening", icon: <Music size={14} /> },
    { key: "podcasts" as const, label: "Podcasts", icon: <Podcast size={14} /> },
    { key: "youtube" as const, label: "Watching", icon: <Youtube size={14} /> },
    { key: "playlists" as const, label: "Playlists", icon: <ListMusic size={14} /> },
];

function readCollapsed(): boolean {
    if (typeof window === "undefined") return false;
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return false;
        return JSON.parse(raw).favoritesCollapsed ?? false;
    } catch {
        return false;
    }
}

function writeCollapsed(collapsed: boolean) {
    if (typeof window === "undefined") return;
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const prefs = raw ? JSON.parse(raw) : {};
        prefs.favoritesCollapsed = collapsed;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {
        // fail silently
    }
}

function FavoritesContent({ favorites }: { favorites: Favorites }) {
    return (
        <>
            {sectionConfig.map(({ key, label, icon }) => {
                const items = favorites[key];
                if (!items || items.length === 0) return null;

                return (
                    <div key={key} className="favorites-section">
                        <h3 className="favorites-section-title">
                            {icon}
                            {label}
                        </h3>
                        <div className="favorites-items">
                            {items.slice(0, 4).map((item) => (
                                <a
                                    key={item.url}
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="favorite-item"
                                >
                                    {item.cover && (
                                        <img
                                            src={item.cover}
                                            alt={item.title}
                                            className="favorite-cover"
                                            loading="lazy"
                                        />
                                    )}
                                    <div className="favorite-info">
                                        <span className="favorite-title">{item.title}</span>
                                        {item.subtitle && (
                                            <span className="favorite-subtitle">{item.subtitle}</span>
                                        )}
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                );
            })}
        </>
    );
}

export function FavoritesSidebar({ favorites }: FavoritesSidebarProps) {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setCollapsed(readCollapsed());
        setMounted(true);
    }, []);

    // Listen for custom event from ContactSidebar's favorites button
    useEffect(() => {
        const handleOpen = () => setMobileOpen(true);
        window.addEventListener("open-favorites-drawer", handleOpen);
        return () => window.removeEventListener("open-favorites-drawer", handleOpen);
    }, []);

    // Close mobile drawer on Escape
    useEffect(() => {
        if (!mobileOpen) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setMobileOpen(false);
        };
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [mobileOpen]);

    if (!favorites) return null;

    const toggle = () => {
        const next = !collapsed;
        setCollapsed(next);
        writeCollapsed(next);
    };

    return (
        <>
            {/* Desktop sidebar */}
            <aside className={`favorites-sidebar ${collapsed ? "favorites-collapsed" : ""}`}>
                <button
                    className="favorites-toggle"
                    onClick={toggle}
                    aria-label={collapsed ? "Expand favorites" : "Collapse favorites"}
                    aria-expanded={!collapsed}
                >
                    {collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                    <span>Favorites</span>
                </button>

                <div
                    className="favorites-content"
                    style={{
                        maxHeight: !mounted ? "none" : collapsed ? "0px" : "2000px",
                        overflow: "hidden",
                        transition: mounted ? "max-height 0.35s ease" : "none",
                    }}
                >
                    <FavoritesContent favorites={favorites} />
                </div>
            </aside>

            {/* Mobile drawer overlay */}
            {mobileOpen && (
                <div className="favorites-drawer-overlay" onClick={() => setMobileOpen(false)}>
                    <aside
                        className="favorites-drawer"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="favorites-drawer-header">
                            <span>Favorites</span>
                            <button
                                className="favorites-drawer-close"
                                onClick={() => setMobileOpen(false)}
                                aria-label="Close favorites"
                            >
                                <X size={16} />
                            </button>
                        </div>
                        <div className="favorites-drawer-content">
                            <FavoritesContent favorites={favorites} />
                        </div>
                    </aside>
                </div>
            )}
        </>
    );
}
