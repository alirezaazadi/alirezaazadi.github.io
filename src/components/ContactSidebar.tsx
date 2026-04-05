"use client";

import { useState } from "react";
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
    X,
} from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
    github: <Github size={16} />,
    linkedin: <Linkedin size={16} />,
    telegram: <Send size={16} />,
    email: <Mail size={16} />,
    flickr: (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="8" cy="12" r="4" />
            <circle cx="16" cy="12" r="4" />
        </svg>
    ),
    goodreads: <BookOpen size={16} />,
};

function getIcon(key: string) {
    return iconMap[key] || <Globe size={16} />;
}

export function ContactSidebar() {
    const [collapsed, setCollapsed] = useState(false);
    
    const socialEntries = Object.entries(siteConfig.social).filter(
        ([, url]) => url && url.length > 0
    );

    const openFavorites = () => {
        window.dispatchEvent(new CustomEvent("open-favorites-drawer"));
    };

    return (
        <aside className={`contact-sidebar ${collapsed ? "collapsed" : ""}`}>
            <div className="contact-sidebar-content-wrapper">
                <div className="contact-sidebar-content">
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

                    <div className="sidebar-divider" />
                </div>
            </div>

            <div 
                className="contact-sidebar-toggle" 
                onClick={() => setCollapsed(!collapsed)}
                aria-label={collapsed ? "Expand contact sidebar" : "Collapse contact sidebar"}
            >
                <User size={20} className="icon-user" />
                <X size={20} className="icon-x" />
            </div>
        </aside>
    );
}
