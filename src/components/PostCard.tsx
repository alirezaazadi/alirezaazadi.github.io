import Link from "next/link";
import type { PostMeta } from "@/lib/post-utils";
import { isRTL } from "@/lib/rtl";

interface PostCardProps {
    post: PostMeta;
}

export function PostCard({ post }: PostCardProps) {
    const rtl = isRTL(post.title + " " + post.summary);

    return (
        <Link
            href={`/post/${post.slug}`}
            className="post-card"
            dir={rtl ? "rtl" : undefined}
        >
            {post.image && (
                <div className="post-card-image">
                    <img
                        src={post.image.startsWith("./") ? `/post/${post.slug}/${post.image.slice(2)}` : post.image}
                        alt={post.title}
                        loading="lazy"
                    />
                </div>
            )}
            <div className="post-card-content">
                <h2 className="post-card-title">{post.title}</h2>
                {post.summary && <p className="post-card-summary">{post.summary}</p>}
                <div className="post-card-meta">
                    <span className="post-card-date">{post.date}</span>
                    {post.categories.length > 0 && (
                        <div className="post-card-categories">
                            {post.categories.map((cat) => (
                                <span key={cat} className="tag">
                                    {cat}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}
