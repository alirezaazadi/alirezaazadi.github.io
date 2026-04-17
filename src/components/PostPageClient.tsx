"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { TranslateButton } from "@/components/TranslateButton";
import { InlineTranslate } from "@/components/InlineTranslate";
import { ReplyButton } from "@/components/ReplyButton";
import { ReaderMode } from "@/components/ReaderMode";
import { ShareButton } from "@/components/ShareButton";
import { ArrowLeft, BookOpen, Pencil, Landmark, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import type { Post } from "@/lib/post-utils";
import { isRTL } from "@/lib/rtl";
import { siteConfig } from "../../site.config";
import { ExpandableImage } from "@/components/ExpandableImage";
import { useClickAway } from "@uidotdev/usehooks";

interface PostPageClientProps {
    post: Post;
}

/** Tracks progressive translation state chunk-by-chunk */
interface ChunkState {
    originals: string[];
    translations: (string | null)[];
    activeIndex: number; // -1 when none is active
    complete: boolean;
}

export function PostPageClient({ post }: PostPageClientProps) {
    const [translatedContent, setTranslatedContent] = useState<string | null>(null);
    const [translationProvider, setTranslationProvider] = useState<string | undefined>(undefined);
    const [chunkState, setChunkState] = useState<ChunkState | null>(null);
    const [readerOpen, setReaderOpen] = useState(false);
    const [archiving, setArchiving] = useState(false);
    const [isDev, setIsDev] = useState(false);
    const [showActionsDropdown, setShowActionsDropdown] = useState(false);
    const router = useRouter();

    const dropdownRef = useClickAway<HTMLDivElement>(() => {
        setShowActionsDropdown(false);
    });

    useEffect(() => {
        // Safe check for dev mode
        if (process.env.NODE_ENV === "development") {
            setIsDev(true);
        }
    }, []);

    // Derived state
    const isTranslated = translatedContent !== null || (chunkState?.complete ?? false);
    const displayContent = translatedContent || post.body;
    const titleRtl = isRTL(post.title);
    const postUrl = `${siteConfig.url}/post/${post.slug}`;

    // ---- Progressive translation handlers ----

    const handleTranslationStart = (originalChunks: string[]) => {
        setChunkState({
            originals: originalChunks,
            translations: new Array(originalChunks.length).fill(null),
            activeIndex: -1,
            complete: false,
        });
        setTranslatedContent(null);
        setTranslationProvider(undefined);
    };

    const handleChunkStart = (index: number) => {
        setChunkState(prev => prev ? { ...prev, activeIndex: index } : null);
    };

    const handleChunkDone = (index: number, translatedText: string) => {
        setChunkState(prev => {
            if (!prev) return null;
            const translations = [...prev.translations];
            translations[index] = translatedText;
            return { ...prev, translations, activeIndex: -1 };
        });
    };

    /** Called when all chunks are done (or from cache) */
    const handleTranslated = (text: string, provider?: string) => {
        setTranslatedContent(text);
        setTranslationProvider(provider);
        // Mark progressive translation as complete (keeps chunk rendering to avoid flash)
        setChunkState(prev => prev ? { ...prev, complete: true, activeIndex: -1 } : null);
    };

    const handleRevert = () => {
        setTranslatedContent(null);
        setTranslationProvider(undefined);
        setChunkState(null);
    };

    // ---- Other handlers ----

    const handleBack = () => {
        // If user navigated from within the blog, go back
        // Otherwise, go to homepage
        if (typeof window !== "undefined" && window.history.length > 1) {
            const referrer = document.referrer;
            if (referrer && referrer.includes(window.location.host)) {
                router.back();
                return;
            }
        }
        router.push("/");
    };

    const handleArchive = async () => {
        setArchiving(true);
        try {
            const res = await fetch("/api/archive", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ slug: post.slug })
            });
            const data = await res.json();
            
            if (res.ok) {
                if (data.alreadyArchived) {
                    alert("This page was archived very recently. You can find it on the Wayback Machine!");
                } else if (data.triggered) {
                    alert("The archival has been triggered and is running in the background. It might take a minute to show up on web.archive.org.");
                } else {
                    alert("Successfully archived on the Wayback Machine!");
                }
            } else {
                const manualUrl = `https://web.archive.org/save/${postUrl}`;
                const errorMessage = data.error || "Unknown error";
                
                if (confirm(`Archive failed: ${errorMessage}\n\nWould you like to try archiving manually on web.archive.org?`)) {
                    window.open(manualUrl, "_blank");
                }
            }
        } catch (e) {
            const manualUrl = `https://web.archive.org/save/${postUrl}`;
            if (confirm("Archive request failed due to a connection issue.\n\nWould you like to try archiving manually on web.archive.org?")) {
                window.open(manualUrl, "_blank");
            }
        }
        setArchiving(false);
    };

    // ---- Render ----

    /** Render the post content — either as progressive chunks or a single block */
    function renderContent() {
        if (chunkState) {
            // Progressive chunk-by-chunk rendering
            return (
                <>
                    {chunkState.originals.map((original, i) => {
                        const translated = chunkState.translations[i];
                        const isActive = chunkState.activeIndex === i;
                        const isDone = translated !== null;

                        // During translation, show animation classes.
                        // After complete, render cleanly with no animation classes.
                        let className = "translation-chunk";
                        if (!chunkState.complete) {
                            if (isActive) className += " chunk-translating";
                            else if (isDone) className += " chunk-done";
                        }

                        return (
                            <div key={i} className={className}>
                                <MarkdownRenderer
                                    content={translated || original}
                                    slug={post.slug}
                                />
                            </div>
                        );
                    })}
                </>
            );
        }

        // Normal single-block rendering (original or cached translation)
        return <MarkdownRenderer content={displayContent} slug={post.slug} />;
    }

    return (
        <article className="post-page">
            <button className="back-link" onClick={handleBack}>
                <ArrowLeft size={14} />
                back to posts
            </button>

            <header className="post-header">
                <h1
                    className="post-title"
                    dir={titleRtl ? "rtl" : "ltr"}
                    style={titleRtl ? { fontFamily: "var(--font-rtl)" } : undefined}
                >
                    {post.title}
                </h1>
                <div className="post-meta-bar">
                    <span className="post-card-date">{post.date}</span>
                    <span className="post-card-date" style={{ marginLeft: "8px" }}>· {post.readingTime}</span>
                    {post.categories.map((cat) => (
                        <Link
                            key={cat}
                            href={`/?category=${encodeURIComponent(cat)}`}
                            className="tag"
                        >
                            {cat}
                        </Link>
                    ))}
                </div>
                <div className="post-actions">
                    {siteConfig.showTranslation && (
                        <TranslateButton
                            originalContent={post.body}
                            slug={post.slug}
                            onTranslated={handleTranslated}
                            onTranslationStart={handleTranslationStart}
                            onChunkStart={handleChunkStart}
                            onChunkDone={handleChunkDone}
                            onRevert={handleRevert}
                            isTranslated={isTranslated}
                            provider={translationProvider}
                        />
                    )}

                    {/* Secondary Actions - Inline on Desktop */}
                    {siteConfig.showAdhdMode && (
                        <button
                            className="btn secondary-action"
                            onClick={() => setReaderOpen(true)}
                            title="ADHD-friendly reading mode: clean text-only view with optional Bionic Reading"
                        >
                            <BookOpen size={14} />
                            ADHD mode
                        </button>
                    )}
                    {siteConfig.showShare && (
                        <div className="secondary-action">
                            <ShareButton postUrl={postUrl} postTitle={post.title} />
                        </div>
                    )}
                    {isDev && (
                        <Link
                            href={`/admin/posts/${post.slug}`}
                            className="btn secondary-action"
                            title="Edit this post (only visible in dev mode)"
                        >
                            <Pencil size={14} />
                            Edit
                        </Link>
                    )}
                    {siteConfig.showArchive && (
                        <button
                            className="btn secondary-action"
                            onClick={handleArchive}
                            disabled={archiving}
                            title="Archive this post on the Wayback Machine (web.archive.org)"
                        >
                            <Landmark size={14} />
                            {archiving ? "Archiving..." : "Archive"}
                        </button>
                    )}

                    {/* Mobile Dropdown for Secondary Actions */}
                    <div className="post-actions-dropdown" ref={dropdownRef}>
                        <button 
                            className="btn post-actions-toggle"
                            onClick={() => setShowActionsDropdown(!showActionsDropdown)}
                            title="More actions"
                        >
                            <MoreHorizontal size={16} />
                        </button>
                        {showActionsDropdown && (
                            <div className="post-actions-menu">
                                {siteConfig.showAdhdMode && (
                                    <button
                                        className="btn"
                                        onClick={() => {
                                            setReaderOpen(true);
                                            setShowActionsDropdown(false);
                                        }}
                                    >
                                        <BookOpen size={14} />
                                        ADHD mode
                                    </button>
                                )}
                                {siteConfig.showShare && (
                                    <ShareButton postUrl={postUrl} postTitle={post.title} />
                                )}
                                {isDev && (
                                    <Link
                                        href={`/admin/posts/${post.slug}`}
                                        className="btn"
                                        onClick={() => setShowActionsDropdown(false)}
                                    >
                                        <Pencil size={14} />
                                        Edit
                                    </Link>
                                )}
                                {siteConfig.showArchive && (
                                    <button
                                        className="btn"
                                        onClick={() => {
                                            handleArchive();
                                            setShowActionsDropdown(false);
                                        }}
                                        disabled={archiving}
                                    >
                                        <Landmark size={14} />
                                        Archive
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {isTranslated && (
                <div className="translation-banner">
                    <span>🌐 showing translated version {translationProvider ? `by ${translationProvider}` : ""}</span>
                    <button onClick={handleRevert}>
                        show original
                    </button>
                </div>
            )}

            {post.image && (
                <ExpandableImage
                    src={
                        post.image.startsWith("./") || post.image.startsWith("media/")
                            ? `/post/${post.slug}/${post.image.replace(/^\.\//, "")}`
                            : post.image
                    }
                    alt={post.title}
                    style={{
                        width: "100%",
                        height: "400px",
                        objectFit: "cover",
                        borderRadius: "var(--radius-md)",
                        marginBottom: 24,
                        border: "1px solid var(--border-color)",
                    }}
                />
            )}

            {renderContent()}
            <InlineTranslate />

            {/* Comment / Reply section at the bottom */}
            <div className="post-comment-section">
                <div className="comment-prompt">
                    <span className="comment-prompt-text">
                        💬 Got any thoughts on this post?
                    </span>
                    <p className="comment-prompt-sub">
                        I&apos;d love to hear from you! Send me your feedback or comments via email.
                    </p>
                    <ReplyButton postTitle={post.title} />
                </div>
            </div>

            {/* Fullscreen ADHD Reader Mode */}
            <ReaderMode
                title={post.title}
                content={translatedContent || post.body}
                isOpen={readerOpen}
                onClose={() => setReaderOpen(false)}
            />
        </article>
    );
}
