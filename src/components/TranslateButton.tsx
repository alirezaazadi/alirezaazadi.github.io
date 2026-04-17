"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Languages, ChevronDown, X } from "lucide-react";
import { siteConfig } from "../../site.config";

interface TranslateButtonProps {
    originalContent: string;
    slug: string;
    /** Called with full translated text (from cache or after all chunks finish) */
    onTranslated: (text: string, provider?: string) => void;
    /** Called when progressive translation starts — provides the original chunks for rendering */
    onTranslationStart: (originalChunks: string[]) => void;
    /** Called when a chunk begins translating (for highlight animation) */
    onChunkStart: (chunkIndex: number) => void;
    /** Called when a chunk finishes translating */
    onChunkDone: (chunkIndex: number, translatedText: string) => void;
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

// ---- Client-side chunking utilities ----

const MAX_CHUNK_SIZE = 4000;

/**
 * Extract code blocks from markdown, replace with placeholders,
 * then split into translatable chunks at paragraph boundaries.
 */
function prepareChunks(text: string): { chunks: string[]; codeBlocks: string[] } {
    // Extract code blocks first so they can't be split across chunks
    const codeBlocks: string[] = [];
    const textWithPlaceholders = text.replace(
        /(```[\s\S]*?```|`[^`\n]+`)/g,
        (match) => {
            codeBlocks.push(match);
            return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
        }
    );

    const chunks = splitAtParagraphs(textWithPlaceholders, MAX_CHUNK_SIZE);
    return { chunks, codeBlocks };
}

function splitAtParagraphs(text: string, maxSize: number): string[] {
    if (text.length <= maxSize) return [text];

    const chunks: string[] = [];
    const paragraphs = text.split(/\n\n/);
    let currentChunk = "";

    for (const para of paragraphs) {
        const candidate = currentChunk ? currentChunk + "\n\n" + para : para;

        if (candidate.length > maxSize && currentChunk.length > 0) {
            chunks.push(currentChunk);
            // If a single paragraph exceeds maxSize, split further by lines
            if (para.length > maxSize) {
                const lines = para.split("\n");
                let lineChunk = "";
                for (const line of lines) {
                    const lc = lineChunk ? lineChunk + "\n" + line : line;
                    if (lc.length > maxSize && lineChunk.length > 0) {
                        chunks.push(lineChunk);
                        lineChunk = line;
                    } else {
                        lineChunk = lc;
                    }
                }
                currentChunk = lineChunk;
            } else {
                currentChunk = para;
            }
        } else {
            currentChunk = candidate;
        }
    }

    if (currentChunk.length > 0) {
        chunks.push(currentChunk);
    }

    return chunks;
}

function restoreCodeBlocks(text: string, codeBlocks: string[]): string {
    return text.replace(/__CODE_BLOCK_(\d+)__/g, (_, idx) => codeBlocks[Number(idx)] || _);
}

// ---- Component ----

export function TranslateButton({
    originalContent,
    slug,
    onTranslated,
    onTranslationStart,
    onChunkStart,
    onChunkDone,
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
    const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
    const pickerRef = useRef<HTMLDivElement>(null);
    const abortRef = useRef<AbortController | null>(null);

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

    function handleCancel() {
        if (abortRef.current) {
            abortRef.current.abort();
            abortRef.current = null;
        }
        setLoading(false);
        setProgress(null);
        onRevert();
    }

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
        const abort = new AbortController();
        abortRef.current = abort;

        try {
            // Split text into chunks (code blocks are extracted so they won't be split)
            const { chunks, codeBlocks } = prepareChunks(originalContent);

            // Send display-ready chunks (with real code blocks) to parent
            const displayChunks = chunks.map(c => restoreCodeBlocks(c, codeBlocks));
            onTranslationStart(displayChunks);
            setProgress({ current: 0, total: chunks.length });

            const translatedChunks: string[] = [];
            let lastProvider = "Gemini";

            for (let i = 0; i < chunks.length; i++) {
                if (abort.signal.aborted) return;

                // Notify parent to highlight this chunk
                onChunkStart(i);

                const res = await fetch("/api/translate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        text: chunks[i],
                        targetLang: lang.code,
                        model: selectedModel.id
                    }),
                    signal: abort.signal,
                });

                if (abort.signal.aborted) return;

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || "Translation failed");
                }

                // Restore code blocks in the translated chunk before sending to parent
                const translatedChunk = restoreCodeBlocks(data.translatedText, codeBlocks);
                translatedChunks.push(translatedChunk);
                lastProvider = data.provider || lastProvider;

                // Notify parent this chunk is done
                onChunkDone(i, translatedChunk);
                setProgress({ current: i + 1, total: chunks.length });
            }

            // All chunks done — join, cache, and signal completion
            const fullTranslation = translatedChunks.join("\n\n");

            setCachedTranslation(slug, lang.code, selectedModel.id, {
                translatedText: fullTranslation,
                provider: lastProvider
            });

            onTranslated(fullTranslation, lastProvider);
        } catch (err: any) {
            if (err.name === "AbortError") return;
            setError(err.message || "Translation failed");
            onRevert();
        } finally {
            setLoading(false);
            setProgress(null);
            abortRef.current = null;
        }
    }

    if (isTranslated && !loading) {
        return (
            <button className="btn" onClick={handleCancel}>
                <Languages size={14} />
                show original {provider ? `(translated by ${provider})` : ""}
            </button>
        );
    }

    return (
        <div className="translate-wrapper" ref={pickerRef}>
            <div className="translate-btn-group">
                {loading ? (
                    <button
                        className="btn translate-progress-btn"
                        onClick={handleCancel}
                        title="Click to cancel translation"
                    >
                        <span className="spinner" />
                        {progress
                            ? `translating… ${progress.current}/${progress.total}`
                            : "preparing…"}
                        <X size={12} className="translate-cancel-icon" />
                    </button>
                ) : (
                    <>
                        <button
                            className="btn"
                            onClick={() => handleTranslate(selectedLang)}
                        >
                            <Languages size={14} />
                            {`translate → ${selectedLang.label}`}
                        </button>
                        <button
                            className="btn translate-lang-toggle"
                            onClick={() => setShowLangPicker(!showLangPicker)}
                            aria-label="Choose language"
                        >
                            <ChevronDown size={12} />
                        </button>
                    </>
                )}
            </div>

            {showLangPicker && !loading && (
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
