"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { isDaytime } from "@/lib/theme";

type Theme = "light" | "dark";

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
    theme: "dark",
    toggleTheme: () => { },
});

export function useTheme() {
    return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>("dark");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem("theme") as Theme | null;
        if (saved) {
            setTheme(saved);
            return;
        }

        // Auto-detect based on sunrise/sunset
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const daytime = isDaytime(pos.coords.latitude, pos.coords.longitude);
                    setTheme(daytime ? "light" : "dark");
                },
                () => {
                    // Fallback to system preference
                    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                    setTheme(prefersDark ? "dark" : "light");
                }
            );
        } else {
            const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            setTheme(prefersDark ? "dark" : "light");
        }
    }, []);

    useEffect(() => {
        if (mounted) {
            document.documentElement.setAttribute("data-theme", theme);
            localStorage.setItem("theme", theme);
        }
    }, [theme, mounted]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    };

    // Prevent flash of wrong theme
    if (!mounted) {
        return (
            <ThemeContext.Provider value={{ theme: "dark", toggleTheme }}>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
              (function() {
                var t = localStorage.getItem('theme');
                if (t) { document.documentElement.setAttribute('data-theme', t); }
                else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
                  document.documentElement.setAttribute('data-theme', 'light');
                } else {
                  document.documentElement.setAttribute('data-theme', 'dark');
                }
              })();
            `,
                    }}
                />
                {children}
            </ThemeContext.Provider>
        );
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}
