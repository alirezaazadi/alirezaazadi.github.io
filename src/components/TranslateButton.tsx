"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Languages, ChevronDown } from "lucide-react";
import { siteConfig } from "../../site.config";

interface TranslateButtonProps {
    originalContent: string;
    slug: string;
    onTranslated: (text: string, provider?: string) => void;
    onRevert: () => void;
    isTranslated: boolean;
    provider?: string;
}

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

const MODELS = [
    { id: "gemini-flash-latest", label: "Gemini Flash (Latest)" },
    { id: "gemma-3-4b-it", label: "Gemma 3 (4B)" },
    { id: "gemini-2.0-flash-lite", label: "Gemini 2.0 Flash Lite" },
    { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
    { id: "google-translate", label: "Google Translate (Legacy)" },
];

const TRANSLATION_CACHE_KEY = "blog-translation-cache";

function getCachedTranslation(slug: string, lang: string, model: string) {
    if (typeof window === "undefined") return null;
    try {
        const cache = JSON.parse(localStorage.getItem(TRANSLATION_CACHE_KEY) || "{}");
        const key = `${slug}:${lang}:${model}`;
        return cache[key];
    } catch {
        return null;
    }
}

function setCachedTranslation(slug: string, lang: string, model: string, result: { translatedText: string, provider: string }) {
    if (typeof window === "undefined") return;
    try {
        const cache = JSON.parse(localStorage.getItem(TRANSLATION_CACHE_KEY) || "{}");
        const key = `${slug}:${lang}:${model}`;
        cache[key] = result;
        
        // Cache rotation: keep only last 100 translations (slug-based keys are smaller)
        const keys = Object.keys(cache);
        if (keys.length > 100) {
            delete cache[keys[0]];
        }
        
        localStorage.setItem(TRANSLATION_CACHE_KEY, JSON.stringify(cache));
    } catch (e) {
        console.warn("Failed to save translation to cache", e);
    }
}

// simpleHash removed as we are now using post slugs for cache keys

export function TranslateButton({
    originalContent,
    slug,
    onTranslated,
    onRevert,
    isTranslated,
    provider
}: TranslateButtonProps) {
    const LANGUAGES = useMemo(() => {
        const allowed = siteConfig.translateLanguages;
        if (!allowed || allowed.length === 0) return ALL_LANGUAGES;
        return ALL_LANGUAGES.filter(l => allowed.includes(l.code));
    }, []);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showLangPicker, setShowLangPicker] = useState(false);
    const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);
    const [selectedModel, setSelectedModel] = useState(MODELS[0]);
    const pickerRef = useRef<HTMLDivElement>(null);

    // Close picker on outside click
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
                setShowLangPicker(false);
            }
        }
        if (showLangPicker) {
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [showLangPicker]);

    async function handleTranslate(lang: typeof LANGUAGES[number]) {
        setSelectedLang(lang);
        setShowLangPicker(false);
        setError(null);

        // Check local cache first
        const cached = getCachedTranslation(slug, lang.code, selectedModel.id);
        if (cached) {
            onTranslated(cached.translatedText, `${cached.provider} (cached)`);
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/translate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text: originalContent,
                    targetLang: lang.code,
                    model: selectedModel.id
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                // Try to parse error message from response
                const errorMessage = data.error?.message || data.error || "Translation failed";
                setError(errorMessage);
                return;
            }

            // Save to cache
            setCachedTranslation(slug, lang.code, selectedModel.id, {
                translatedText: data.translatedText,
                provider: data.provider
            });

            onTranslated(data.translatedText, data.provider);
        } catch (err) {
            setError("Network error — check your connection");
        } finally {
            setLoading(false);
        }
    }

    if (isTranslated) {
        return (
            <button className="btn" onClick={onRevert}>
                <Languages size={14} />
                show original {provider ? `(translated by ${provider})` : ""}
            </button>
        );
    }

    return (
        <div className="translate-wrapper" ref={pickerRef}>
            <div className="translate-btn-group">
                <button
                    className={`btn ${loading ? "loading" : ""}`}
                    onClick={() => handleTranslate(selectedLang)}
                    disabled={loading}
                >
                    <Languages size={14} />
                    {loading ? "translating..." : `translate → ${selectedLang.label}`}
                </button>
                <button
                    className="btn translate-lang-toggle"
                    onClick={() => setShowLangPicker(!showLangPicker)}
                    disabled={loading}
                    aria-label="Choose language"
                >
                    <ChevronDown size={12} />
                </button>
            </div>

            {showLangPicker && (
                <div className="lang-picker-popup">
                    <div className="model-selector-section" style={{
                        padding: "12px",
                        borderBottom: "1px solid var(--border-color)",
                        marginBottom: "0",
                        position: "sticky",
                        top: 0,
                        backgroundColor: "var(--bg-primary)", // Ensure opacity
                        zIndex: 10,
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px"
                    }}>
                        <div style={{
                            fontSize: "10px",
                            fontWeight: "600",
                            opacity: 0.8,
                            letterSpacing: "0.5px",
                            textTransform: "uppercase"
                        }}>
                            Translator
                        </div>
                        <select
                            value={selectedModel.id}
                            onChange={(e) => {
                                const model = MODELS.find(m => m.id === e.target.value);
                                if (model) setSelectedModel(model);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                width: "100%",
                                padding: "6px 8px",
                                fontSize: "13px",
                                borderRadius: "6px",
                                background: "var(--bg-secondary)",
                                color: "var(--fg-primary)",
                                border: "1px solid var(--border-color)",
                                cursor: "pointer",
                                outline: "none"
                            }}
                        >
                            {MODELS.map(m => (
                                <option key={m.id} value={m.id}>
                                    {m.id === "google-translate" ? m.label : `(AI) ${m.label}`}
                                </option>
                            ))}
                        </select>
                    </div>
                    {LANGUAGES.map((lang) => (
                        <button
                            key={lang.code}
                            className={`lang-option ${selectedLang.code === lang.code ? "active" : ""}`}
                            onClick={() => handleTranslate(lang)}
                        >
                            {lang.label}
                        </button>
                    ))}
                </div>
            )}

            {error && <div className="translate-error">⚠ {error}</div>}
        </div>
    );
}
