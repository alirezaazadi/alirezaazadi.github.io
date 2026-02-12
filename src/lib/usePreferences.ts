"use client";

import { useState, useEffect, useCallback } from "react";

type Preferences = {
    theme: "dark" | "light";
    favoritesCollapsed: boolean;
};

const DEFAULTS: Preferences = {
    theme: "dark",
    favoritesCollapsed: false,
};

const STORAGE_KEY = "blog-preferences";

function readStorage(): Preferences {
    if (typeof window === "undefined") return DEFAULTS;
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return DEFAULTS;
        return { ...DEFAULTS, ...JSON.parse(raw) };
    } catch {
        return DEFAULTS;
    }
}

function writeStorage(prefs: Preferences) {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {
        // localStorage may be full or blocked — fail silently
    }
}

/**
 * Hook for reading/writing user preferences to localStorage.
 * SSR-safe: returns defaults on server, reads from storage on mount.
 */
export function usePreferences() {
    const [prefs, setPrefs] = useState<Preferences>(DEFAULTS);
    const [loaded, setLoaded] = useState(false);

    // Read from localStorage on mount
    useEffect(() => {
        setPrefs(readStorage());
        setLoaded(true);
    }, []);

    const updatePreference = useCallback(
        <K extends keyof Preferences>(key: K, value: Preferences[K]) => {
            setPrefs((prev) => {
                const next = { ...prev, [key]: value };
                writeStorage(next);
                return next;
            });
        },
        []
    );

    return { prefs, loaded, updatePreference };
}
