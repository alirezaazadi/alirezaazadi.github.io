"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Languages, Loader2, ChevronDown, X } from "lucide-react";

const LANGUAGES = [
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

// AI models to try in order, then fallback to Google Translate
const AI_MODELS = [
    "gemma-3-4b-it",
    "gemini-2.0-flash-lite",
    "gemini-2.0-flash",
];

interface PopupState {
    x: number;
    y: number;
    selectedText: string;
}

export function InlineTranslate() {
    const [popup, setPopup] = useState<PopupState | null>(null);
    const [loading, setLoading] = useState(false);
    const [translatedText, setTranslatedText] = useState<string | null>(null);
    const [provider, setProvider] = useState<string | null>(null);
    const [showLangPicker, setShowLangPicker] = useState(false);
    const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);
    const [error, setError] = useState<string | null>(null);
    const popupRef = useRef<HTMLDivElement>(null);
    const ignoreNextMouseUp = useRef(false);

    const dismiss = useCallback(() => {
        setPopup(null);
        setLoading(false);
        setTranslatedText(null);
        setProvider(null);
        setShowLangPicker(false);
        setError(null);
    }, []);

    // Listen for text selection inside .markdown-body
    useEffect(() => {
        function handleMouseUp(e: MouseEvent) {
            // If clicking inside our popup, don't dismiss
            if (popupRef.current?.contains(e.target as Node)) {
                return;
            }

            // If we're showing translated text or loading, clicking outside dismisses
            if (translatedText || loading) {
                dismiss();
                return;
            }

            if (ignoreNextMouseUp.current) {
                ignoreNextMouseUp.current = false;
                return;
            }

            const selection = window.getSelection();
            const text = selection?.toString().trim();

            if (!text || text.length < 2) {
                setPopup(null);
                return;
            }

            // Check if selection is inside a .markdown-body element
            const anchorNode = selection?.anchorNode;
            const el = anchorNode instanceof HTMLElement
                ? anchorNode
                : anchorNode?.parentElement;
            if (!el?.closest(".markdown-body")) {
                setPopup(null);
                return;
            }

            // Position the popup near the selection
            const range = selection!.getRangeAt(0);
            const rect = range.getBoundingClientRect();

            setPopup({
                x: rect.left + rect.width / 2 + window.scrollX,
                y: rect.top + window.scrollY - 8,
                selectedText: text,
            });
            setTranslatedText(null);
            setProvider(null);
            setError(null);
        }

        document.addEventListener("mouseup", handleMouseUp);
        return () => document.removeEventListener("mouseup", handleMouseUp);
    }, [translatedText, loading, dismiss]);

    // Close on Escape
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") dismiss();
        }
        if (popup) {
            document.addEventListener("keydown", handleKeyDown);
            return () => document.removeEventListener("keydown", handleKeyDown);
        }
    }, [popup, dismiss]);

    async function handleTranslate(lang: typeof LANGUAGES[number]) {
        if (!popup) return;

        setSelectedLang(lang);
        setShowLangPicker(false);
        setLoading(true);
        setError(null);
        setTranslatedText(null);
        ignoreNextMouseUp.current = true;

        // Try AI models in sequence, then fallback to Google Translate
        const modelsToTry = [...AI_MODELS, "google-translate"];

        for (const model of modelsToTry) {
            try {
                const res = await fetch("/api/translate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        text: popup.selectedText,
                        targetLang: lang.code,
                        model,
                    }),
                });

                if (!res.ok) {
                    // If this model failed, try the next one
                    console.warn(`Model ${model} failed with status ${res.status}, trying next...`);
                    continue;
                }

                const data = await res.json();
                if (data.translatedText) {
                    setTranslatedText(data.translatedText);
                    setProvider(data.provider || model);
                    setLoading(false);
                    return;
                }
            } catch (err) {
                console.warn(`Model ${model} threw error, trying next...`, err);
                continue;
            }
        }

        // All models failed
        setError("Translation failed — all providers unavailable");
        setLoading(false);
    }

    if (!popup) return null;

    // Compute popup position — center above selection
    const style: React.CSSProperties = {
        position: "absolute",
        left: `${popup.x}px`,
        top: `${popup.y}px`,
        transform: "translate(-50%, -100%)",
        zIndex: 9999,
    };

    return createPortal(
        <div ref={popupRef} className="inline-translate-popup" style={style}>
            {/* Translated text result */}
            {translatedText && (
                <div className="inline-translate-result">
                    <div className="inline-translate-result-header">
                        <span className="inline-translate-provider">
                            {provider}
                        </span>
                        <button
                            className="inline-translate-close"
                            onClick={dismiss}
                            aria-label="Close translation"
                        >
                            <X size={12} />
                        </button>
                    </div>
                    <div className="inline-translate-result-text">
                        {translatedText}
                    </div>
                </div>
            )}

            {/* Error state */}
            {error && !translatedText && (
                <div className="inline-translate-error">
                    <span>⚠ {error}</span>
                    <button className="inline-translate-close" onClick={dismiss}>
                        <X size={12} />
                    </button>
                </div>
            )}

            {/* Translate button + language picker */}
            {!translatedText && !error && (
                <div className="inline-translate-controls">
                    <button
                        className={`inline-translate-btn ${loading ? "loading" : ""}`}
                        onClick={() => handleTranslate(selectedLang)}
                        disabled={loading}
                        title={`Translate to ${selectedLang.label}`}
                    >
                        {loading ? (
                            <Loader2 size={14} className="spin" />
                        ) : (
                            <Languages size={14} />
                        )}
                        <span className="inline-translate-btn-label">
                            {loading ? "" : selectedLang.label}
                        </span>
                    </button>
                    <button
                        className="inline-translate-lang-btn"
                        onClick={() => setShowLangPicker(!showLangPicker)}
                        disabled={loading}
                        aria-label="Choose language"
                    >
                        <ChevronDown size={10} />
                    </button>
                </div>
            )}

            {/* Language picker dropdown */}
            {showLangPicker && !translatedText && (
                <div className="inline-translate-lang-picker">
                    {LANGUAGES.map((lang) => (
                        <button
                            key={lang.code}
                            className={`inline-translate-lang-option ${selectedLang.code === lang.code ? "active" : ""}`}
                            onClick={() => handleTranslate(lang)}
                        >
                            {lang.label}
                        </button>
                    ))}
                </div>
            )}
        </div>,
        document.body
    );
}
