"use client";

import Link from "next/link";
import { siteConfig } from "../../site.config";
import {
    Github,
    Linkedin,
    Send,
    Mail,
    BookOpen,
    Globe,
    Camera,
    User,
    Star,
} from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
    github: <Github size={16} />,
    linkedin: <Linkedin size={16} />,
    telegram: <Send size={16} />,
    email: <Mail size={16} />,
    flickr: <Camera size={16} />,
    goodreads: <BookOpen size={16} />,
};

function getIcon(key: string) {
    return iconMap[key] || <Globe size={16} />;
}

export function ContactSidebar() {
    const socialEntries = Object.entries(siteConfig.social).filter(
        ([, url]) => url && url.length > 0
    );

    const openFavorites = () => {
        window.dispatchEvent(new CustomEvent("open-favorites-drawer"));
    };

    return (
        <aside className="contact-sidebar">
            {/* About Me link */}
            <Link href="/about" aria-label="About me">
                <User size={16} />
                <span className="tooltip">about me</span>
            </Link>

            <div className="sidebar-divider" />

            {socialEntries.map(([key, url]) => (
                <a
                    key={key}
                    href={url}
                    target={key === "email" ? undefined : "_blank"}
                    rel={key === "email" ? undefined : "noopener noreferrer"}
                    aria-label={key}
                >
                    {getIcon(key)}
                    <span className="tooltip">{key}</span>
                </a>
            ))}

            {/* Favorites button — visible only on mobile via CSS */}
            <button
                className="favorites-mobile-btn"
                onClick={openFavorites}
                aria-label="Show favorites"
            >
                <Star size={16} fill="currentColor" />
            </button>
        </aside>
    );
}
