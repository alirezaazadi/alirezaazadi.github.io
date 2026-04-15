"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Post {
    slug: string;
    title: string;
    date: string;
    categories: string[];
    hidden?: boolean;
}

export default function AdminPostsPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetch("/api/admin/posts")
            .then(r => r.json())
            .then(data => {
                setPosts(data);
                setLoading(false);
            })
            .catch(e => {
                console.error(e);
                setLoading(false);
            });
    }, []);

    async function handleDelete(slug: string) {
        if (!confirm(`Are you sure you want to delete ${slug}?`)) return;
        
        try {
            const res = await fetch(`/api/admin/posts/${slug}`, { method: "DELETE" });
            if (res.ok) {
                setPosts(posts.filter(p => p.slug !== slug));
            } else {
                alert("Failed to delete post.");
            }
        } catch (e) {
            alert("Error deleting post.");
        }
    }

    if (loading) return <div>Loading posts...</div>;

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
                <h1>Manage Posts</h1>
                <Link href="/admin/posts/new" className="btn">
                    + New Post
                </Link>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {posts.map(post => (
                    <div key={post.slug} style={{ display: "flex", justifyContent: "space-between", padding: 15, border: "1px solid var(--border-color)", borderRadius: 8, alignItems: "center" }}>
                        <div>
                            <Link href={`/admin/posts/${post.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
                                <h3 className="admin-post-title" style={{ margin: "0 0 5px 0", cursor: "pointer", transition: "color 0.2s", display: "flex", alignItems: "center", gap: 8 }}>
                                    {post.title}
                                    {post.hidden && (
                                        <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: "rgba(234, 179, 8, 0.15)", color: "#eab308", border: "1px solid rgba(234, 179, 8, 0.3)", fontWeight: 500, letterSpacing: 0.5, lineHeight: 1, whiteSpace: "nowrap" }}>Draft</span>
                                    )}
                                </h3>
                            </Link>
                            <div style={{ fontSize: "0.85em", opacity: 0.7 }}>
                                {post.date} &bull; {post.slug}
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: 10 }}>
                            <Link href={`/admin/posts/${post.slug}`} className="btn btn-small">Edit</Link>
                            <button className="btn btn-small" onClick={() => handleDelete(post.slug)} style={{ color: "red", borderColor: "red" }}>Delete</button>
                        </div>
                    </div>
                ))}
            </div>
            {posts.length === 0 && <p className="text-secondary">No posts found.</p>}
        </div>
    );
}
