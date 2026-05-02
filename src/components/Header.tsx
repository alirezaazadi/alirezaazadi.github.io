"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "../../site.config";
import { ThemeToggle } from "./ThemeToggle";
import { TerminalButton } from "./TerminalButton";
import { LanguageToggle } from "./LanguageToggle";

interface HeaderProps {
    dict: Record<string, string>;
    lang: "fa" | "en";
}

export function Header({ dict, lang }: HeaderProps) {
    const pathname = usePathname();

    return (
        <header className="header">
            <div className="header-left">
                <Link href="/" className="header-logo">
                    {siteConfig.author}
                    <span className="cursor">_</span>
                </Link>
                <nav className="header-nav">
                    <Link href="/" className={pathname === "/" ? "active" : ""}>
                        {dict.posts}
                    </Link>
                    {siteConfig.showAbout && (
                        <Link href="/about" className={pathname === "/about" ? "active" : ""}>
                            {dict.about}
                        </Link>
                    )}
                    {siteConfig.showSuggestions && (
                        <Link href="/suggestions" className={pathname === "/suggestions" ? "active" : ""}>
                            {dict.suggestions}
                        </Link>
                    )}
                </nav>
            </div>
            <div className="header-right">
                {process.env.NODE_ENV === 'development' && (
                    <Link href="/admin" className="btn" style={{ fontSize: "12px", padding: "4px 8px", marginRight: "10px" }}>
                        {dict.admin}
                    </Link>
                )}
                {siteConfig.showTerminal && <TerminalButton />}
                <LanguageToggle currentLang={lang} />
                <ThemeToggle />
            </div>
        </header>
    );
}
