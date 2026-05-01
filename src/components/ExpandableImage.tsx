"use client";

import { useState, useEffect } from "react";
import { Maximize2, X } from "lucide-react";

interface ExpandableImageProps {
    src: string;
    alt: string;
    className?: string;
    style?: React.CSSProperties;
}

export function ExpandableImage({ src, alt, className, style }: ExpandableImageProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Close on Escape key
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsOpen(false);
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen]);

    // Lock body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    return (
        <>
            <figure
                className={`expandable-image-container ${className || ""}`}
                style={{ position: "relative", display: "inline-block", margin: 0, textAlign: "center", ...style }}
            >
                <div style={{ position: "relative", display: "inline-block", width: "100%" }}>
                    <img
                        src={src}
                        alt={alt}
                        className="expandable-image-files"
                        style={{ ...style, cursor: "zoom-in", display: "block" }}
                        onClick={() => setIsOpen(true)}
                        loading="lazy"
                    />
                    <button
                        className="expand-button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsOpen(true);
                        }}
                        aria-label="Expand image"
                        style={{
                            position: "absolute",
                            bottom: "12px",
                            right: "12px",
                            background: "rgba(0, 0, 0, 0.6)",
                            color: "white",
                            border: "none",
                            borderRadius: "50%",
                            width: "32px",
                            height: "32px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            opacity: 0,
                            transition: "opacity 0.2s",
                        }}
                    >
                        <Maximize2 size={16} />
                    </button>
                </div>
                {alt && alt.trim() !== "" && alt.toLowerCase() !== "image" && (
                    <figcaption className="image-caption" style={{ marginTop: "8px", fontSize: "13px", color: "var(--text-muted)" }}>
                        {alt}
                    </figcaption>
                )}
            </figure>

            {isOpen && (
                <div
                    className="image-lightbox-overlay"
                    onClick={() => setIsOpen(false)}
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0, 0, 0, 0.9)",
                        zIndex: 9999,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "20px",
                        animation: "fadeIn 0.2s ease-out",
                    }}
                >
                    <button
                        className="lightbox-close"
                        onClick={() => setIsOpen(false)}
                        style={{
                            position: "absolute",
                            top: "20px",
                            right: "20px",
                            background: "transparent",
                            border: "none",
                            color: "white",
                            cursor: "pointer",
                            padding: "8px",
                            zIndex: 10000,
                        }}
                    >
                        <X size={32} />
                    </button>
                    <img
                        src={src}
                        alt={alt}
                        style={{
                            maxWidth: "100%",
                            maxHeight: "100%",
                            objectFit: "contain",
                            borderRadius: "4px",
                            boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}

            <style jsx global>{`
                .expandable-image-container:hover .expand-button {
                    opacity: 1 !important;
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>
        </>
    );
}
