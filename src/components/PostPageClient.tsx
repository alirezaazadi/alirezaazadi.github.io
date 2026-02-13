"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { TranslateButton } from "@/components/TranslateButton";
import { ReplyButton } from "@/components/ReplyButton";
import { ReaderMode } from "@/components/ReaderMode";
import { ShareButton } from "@/components/ShareButton";
import { ArrowLeft, BookOpen } from "lucide-react";
import Link from "next/link";
import type { Post } from "@/lib/post-utils";
import { isRTL } from "@/lib/rtl";
import { siteConfig } from "../../site.config";

interface PostPageClientProps {
    post: Post;
}

export function PostPageClient({ post }: PostPageClientProps) {
    const [translatedContent, setTranslatedContent] = useState<string | null>(null);
    const [readerOpen, setReaderOpen] = useState(false);
    const router = useRouter();
    const isTranslated = translatedContent !== null;
    const displayContent = translatedContent || post.body;
    const titleRtl = isRTL(post.title);
    const postUrl = `${siteConfig.url}/post/${post.slug}`;

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
                    <TranslateButton
                        originalContent={post.body}
                        onTranslated={setTranslatedContent}
                        onRevert={() => setTranslatedContent(null)}
                        isTranslated={isTranslated}
                    />
                    <button
                        className="btn"
                        onClick={() => setReaderOpen(true)}
                        title="ADHD-friendly reading mode: clean text-only view with optional Bionic Reading"
                    >
                        <BookOpen size={14} />
                        ADHD mode
                    </button>
                    <ShareButton postUrl={postUrl} postTitle={post.title} />
                </div>
            </header>

            {isTranslated && (
                <div className="translation-banner">
                    <span>🌐 showing translated version</span>
                    <button onClick={() => setTranslatedContent(null)}>
                        show original
                    </button>
                </div>
            )}

            {post.image && (
                <img
                    src={post.image}
                    alt={post.title}
                    style={{
                        width: "100%",
                        borderRadius: "var(--radius-md)",
                        marginBottom: 24,
                        border: "1px solid var(--border-color)",
                    }}
                />
            )}

            <MarkdownRenderer content={displayContent} slug={post.slug} />

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
                content={displayContent}
                isOpen={readerOpen}
                onClose={() => setReaderOpen(false)}
            />
        </article>
    );
}
