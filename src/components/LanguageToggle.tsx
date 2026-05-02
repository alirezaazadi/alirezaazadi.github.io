"use client";

import { useRouter } from "next/navigation";
import { Languages } from "lucide-react";

export function LanguageToggle({ currentLang }: { currentLang: "fa" | "en" }) {
    const router = useRouter();

    const toggleLang = () => {
        const nextLang = currentLang === "fa" ? "en" : "fa";
        document.cookie = `lang=${nextLang}; path=/; max-age=31536000`; // 1 year
        router.refresh(); // Refresh to apply server-side language changes
    };

    return (
        <button
            className="theme-toggle"
            onClick={toggleLang}
            aria-label={`Switch to ${currentLang === "fa" ? "English" : "Persian"}`}
            title={`Switch to ${currentLang === "fa" ? "English" : "Persian"}`}
            style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", fontWeight: "bold", marginLeft: "10px", marginRight: "10px" }}
        >
            <Languages size={16} />
            {currentLang === "fa" ? "EN" : "FA"}
        </button>
    );
}
