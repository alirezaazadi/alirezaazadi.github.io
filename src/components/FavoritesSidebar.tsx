"use client";

import { useState, useEffect } from "react";
import { Book, Music, Podcast, Film, ListMusic, ChevronLeft, ChevronRight, X, Newspaper, Star } from "lucide-react";

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
    movies: FavoriteItem[];
    playlists: FavoriteItem[];
    magazines: FavoriteItem[];
}

interface FavoritesSidebarProps {
    favorites: Favorites | null;
    title?: string;
}

const STORAGE_KEY = "blog-preferences";

const sectionConfig = [
    { key: "books" as const, label: "Reading", icon: <Book size={14} /> },
    { key: "magazines" as const, label: "Magazines", icon: <Newspaper size={14} /> },
    { key: "music" as const, label: "Listening", icon: <Music size={14} /> },
    { key: "podcasts" as const, label: "Podcasts", icon: <Podcast size={14} /> },
    { key: "movies" as const, label: "Movies", icon: <Film size={14} /> },
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



function FavoritesSection({
    title,
    icon,
    items,
}: {
    title: string;
    icon: React.ReactNode;
    items: FavoriteItem[];
}) {
    const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
        const item = e.currentTarget;
        const titleEl = item.querySelector<HTMLElement>(".favorite-title");
        const subtitleEl = item.querySelector<HTMLElement>(".favorite-subtitle");
        [titleEl, subtitleEl].forEach((el) => {
            if (!el) return;
            if (el.scrollWidth > el.clientWidth) {
                const overflow = el.scrollWidth - el.clientWidth;
                // Speed: ~40px/s so longer text takes proportionally longer
                const duration = Math.max(1, overflow / 40);
                // Remove element-level overflow so full text is painted;
                // parent .favorite-info still clips via its own overflow:hidden
                el.style.overflow = "visible";
                el.style.textOverflow = "clip";
                el.style.transition = `transform ${duration}s linear`;
                el.style.transform = `translateX(-${overflow}px)`;
            }
        });
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
        const item = e.currentTarget;
        const titleEl = item.querySelector<HTMLElement>(".favorite-title");
        const subtitleEl = item.querySelector<HTMLElement>(".favorite-subtitle");
        [titleEl, subtitleEl].forEach((el) => {
            if (!el) return;
            el.style.transition = "transform 0.3s ease";
            el.style.transform = "translateX(0)";
            el.style.overflow = "hidden";
            el.style.textOverflow = "ellipsis";
        });
    };

    return (
        <div className="favorites-section">
            <h3 className="favorites-section-title">
                {icon}
                {title}
            </h3>
            <div className="favorites-section-container">
                <div className="favorites-items">
                    {items.map((item) => (
                        <a
                            key={item.url}
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="favorite-item"
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
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
        </div>
    );
}


function FavoritesContent({ favorites }: { favorites: Favorites }) {
    return (
        <>
            {sectionConfig.map(({ key, label, icon }) => {
                const items = favorites[key];
                if (!items || items.length === 0) return null;

                return (
                    <FavoritesSection
                        key={key}
                        title={label}
                        icon={icon}
                        items={items}
                    />
                );
            })}
        </>
    );
}

export function FavoritesSidebar({ favorites, title = "Favorites" }: FavoritesSidebarProps) {
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
                <div 
                    className="favorites-sidebar-toggle" 
                    onClick={toggle}
                    aria-label={collapsed ? "Expand favorites" : "Collapse favorites"}
                >
                    {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </div>

                <div
                    className="favorites-content-wrapper"
                    style={{ display: collapsed ? "none" : "block" }}
                >
                    <div className="favorites-header">
                        <span>{title}</span>
                    </div>
                    <div className="favorites-content">
                        <FavoritesContent favorites={favorites} />
                    </div>
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
                            <span>{title}</span>
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
