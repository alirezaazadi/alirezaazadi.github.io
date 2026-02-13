"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "../../site.config";
import { ThemeToggle } from "./ThemeToggle";
import { TerminalButton } from "./TerminalButton";

export function Header() {
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
                        posts
                    </Link>
                    <Link href="/about" className={pathname === "/about" ? "active" : ""}>
                        about
                    </Link>
                    <Link href="/suggestions" className={pathname === "/suggestions" ? "active" : ""}>
                        suggestions
                    </Link>
                </nav>
            </div>
            <div className="header-right">
                <TerminalButton />
                <ThemeToggle />
            </div>
        </header>
    );
}
