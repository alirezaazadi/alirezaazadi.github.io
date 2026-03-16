"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { X, Eye } from "lucide-react";
import { getDirection } from "@/lib/rtl";

interface ReaderModeProps {
    title: string;
    content: string;
    isOpen: boolean;
    onClose: () => void;
}

/**
 * Apply Bionic Reading: bold the first ~40% of each word.
 * Crucially, this ONLY modifies text nodes, leaving HTML tags intact.
 */
function applyBionicReading(html: string): string {
    // Split into HTML tags and text content
    return html.replace(/>([^<]+)</g, (match, textContent: string) => {
        const bionicText = textContent.replace(/[\p{L}\p{N}]+/gu, (word: string) => {
            const isArabic = /[\p{Script=Arabic}]/u.test(word);
            const boldLen = Math.ceil(word.length * 0.4);
            const boldPart = word.slice(0, boldLen);
            const restPart = word.slice(boldLen);

            if (isArabic) {
                if (word.length <= 1) return `<b>${word}</b>`;
                // Inject Zero-Width Joiners to preserve cursive connection across the HTML tag boundary
                return `<b>${boldPart}&zwj;</b>&zwj;${restPart}`;
            }

            if (word.length <= 1) return `<b>${word}</b>`;
            return `<b>${boldPart}</b>${restPart}`;
        });
        return `>${bionicText}<`;
    });
}

/**
 * Converts markdown to clean readable HTML for the reader overlay
 */
function markdownToReadable(md: string): string {
    let html = md;

    // Remove image/embed syntax first
    html = html.replace(/!\[([^\]]*)\]\([^)]+\)/g, "");
    html = html.replace(/\{%\s*video\s+[^%]+%\}/g, "");
    html = html.replace(/\{%\s*spotify\s+[^%]+%\}/g, "");
    html = html.replace(/!\[\[[^\]]+\]\]/g, "");

    // Remove code blocks FIRST (before inline code)
    html = html.replace(/```[\s\S]*?```/g, '<p class="reader-code-block">[code block]</p>');

    // Inline code (after code block removal)
    html = html.replace(/`([^`]+)`/g, '<code class="reader-code">$1</code>');

    // Headers → styled paragraphs
    html = html.replace(/^#{1,6}\s+(.+)$/gm, '<p class="reader-heading">$1</p>');

    // Bold / italic
    html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

    // Blockquotes
    html = html.replace(/^>\s*(.+)$/gm, '<blockquote class="reader-quote">$1</blockquote>');

    // Links → just text
    html = html.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

    // Horizontal rules
    html = html.replace(/^---+$/gm, '<hr class="reader-hr" />');

    // Lists
    html = html.replace(/^[-*]\s+(.+)$/gm, '<li class="reader-li">$1</li>');
    html = html.replace(/^\d+\.\s+(.+)$/gm, '<li class="reader-li">$1</li>');

    // Tables → skip
    html = html.replace(/\|.+\|/g, "");
    html = html.replace(/^[-|:\s]+$/gm, "");

    // Wrap remaining plain text lines in paragraphs
    html = html
        .split("\n")
        .map((line) => {
            const trimmed = line.trim();
            if (!trimmed) return "";
            if (trimmed.startsWith("<")) return trimmed;
            return `<p>${trimmed}</p>`;
        })
        .filter(Boolean)
        .join("\n");

    return html;
}

export function ReaderMode({ title, content, isOpen, onClose }: ReaderModeProps) {
    const [bionicEnabled, setBionicEnabled] = useState(false);
    const dir = getDirection(content);

    const readableHtml = useMemo(() => markdownToReadable(content), [content]);

    const displayHtml = useMemo(() => {
        if (!bionicEnabled) return readableHtml;
        return applyBionicReading(readableHtml);
    }, [readableHtml, bionicEnabled]);

    // Lock body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    // Close on Escape
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        },
        [onClose]
    );

    useEffect(() => {
        if (isOpen) {
            window.addEventListener("keydown", handleKeyDown);
            return () => window.removeEventListener("keydown", handleKeyDown);
        }
    }, [isOpen, handleKeyDown]);

    if (!isOpen) return null;

    return (
        <div className="reader-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="reader-container" dir={dir}>
                <header className="reader-header">
                    <div className="reader-controls">
                        <button
                            className={`reader-toggle ${bionicEnabled ? "active" : ""}`}
                            onClick={() => setBionicEnabled(!bionicEnabled)}
                            title="Bionic Reading: bolds the beginning of each word to help focus"
                        >
                            <Eye size={14} />
                            {bionicEnabled ? "bionic: on" : "bionic: off"}
                        </button>
                    </div>
                    <button className="reader-close" onClick={onClose} aria-label="Close reader">
                        <X size={20} />
                    </button>
                </header>

                <h1 className="reader-title">{title}</h1>

                <div
                    className={`reader-content ${bionicEnabled ? "bionic" : ""}`}
                    dangerouslySetInnerHTML={{ __html: displayHtml }}
                />

                <div className="reader-footer">
                    <span>press <kbd>Esc</kbd> to close</span>
                </div>
            </div>
        </div>
    );
}
