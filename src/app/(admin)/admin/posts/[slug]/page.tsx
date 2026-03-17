"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Landmark } from "lucide-react";
import { RichEditor } from "@/components/RichEditor";

interface PostEditorProps {
    params: Promise<{ slug: string }>;
}

export default function PostEditor({ params }: PostEditorProps) {
    const resolvedParams = use(params);
    const slugParam = resolvedParams.slug;
    const isNew = slugParam === "new";

    const router = useRouter();
    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    
    const [slug, setSlug] = useState("");
    const [title, setTitle] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [summary, setSummary] = useState("");
    const [categories, setCategories] = useState("");
    const [keywords, setKeywords] = useState("");
    const [image, setImage] = useState("");
    const [content, setContent] = useState("");
    const [generatingTags, setGeneratingTags] = useState(false);
    const [archive, setArchive] = useState(false);

    useEffect(() => {
        if (!isNew) {
            fetch(`/api/admin/posts/${slugParam}`)
                .then(r => r.json())
                .then(data => {
                    if (data.error) {
                        alert(data.error);
                        router.push("/admin/posts");
                        return;
                    }
                    setSlug(data.slug || slugParam);
                    setTitle(data.title || "");
                    setDate(data.date || "");
                    setSummary(data.summary || "");
                    setCategories((data.categories || []).join(", "));
                    setKeywords((data.keywords || []).join(", "));
                    setImage(data.image || "");
                    setContent(data.content || "");
                    setLoading(false);
                })
                .catch(e => {
                    alert("Error loading post");
                    router.push("/admin/posts");
                });
        }
    }, [slugParam, isNew, router]);

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        
        const payload = {
            slug: isNew ? slug : slugParam,
            title,
            date,
            summary,
            categories: categories.split(",").map(c => c.trim()).filter(Boolean),
            keywords: keywords.split(",").map(k => k.trim()).filter(Boolean),
            image,
            content,
            archive
        };

        const method = isNew ? "POST" : "PUT";
        const url = isNew ? "/api/admin/posts" : `/api/admin/posts/${slugParam}`;

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            
            if (res.ok) {
                if (isNew) {
                    router.push(`/admin/posts/${data.slug}`);
                } else {
                    alert("Saved successfully.");
                }
            } else {
                alert("Error: " + data.error);
            }
        } catch (e: any) {
            alert("Failed to save post.");
        }
        setSaving(false);
    }

    async function generateAITags() {
        if (!content.trim() && !title.trim()) {
            alert("Please write some content or a title first so AI can generate tags.");
            return;
        }
        setGeneratingTags(true);
        try {
            const res = await fetch("/api/admin/ai/tags", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, content })
            });
            const data = await res.json();
            if (res.ok && data.tags) {
                setKeywords(data.tags.join(", "));
            } else {
                alert("Failed to generate tags: " + (data.error || "Unknown error"));
            }
        } catch (e: any) {
            alert("Error calling AI: " + e.message);
        }
        setGeneratingTags(false);
    }

    async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
        if (!e.target.files?.[0]) return;
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", "post");
        try {
            const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
            const data = await res.json();
            if (res.ok) setImage(data.url);
            else alert("Upload failed: " + data.error);
        } catch (err) {
            alert("Upload failed.");
        }
        e.target.value = '';
    }

    if (loading) return <div>Loading...</div>;

    const inputStyle = { width: "100%", padding: "8px", marginBottom: "15px", borderRadius: "4px", border: "1px solid var(--border-color)", background: "var(--bg-secondary)", color: "var(--fg-primary)" };

    return (
        <form onSubmit={handleSave} style={{ maxWidth: 800, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h1>{isNew ? "New Post" : "Edit Post"}</h1>
                <div style={{ display: "flex", gap: 15, alignItems: "center" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer", fontSize: 13, color: "var(--fg-secondary)" }} title="When you Publish this site, the current post URL will be securely archived on web.archive.org">
                        <Landmark size={14} />
                        <input type="checkbox" checked={archive} onChange={e => setArchive(e.target.checked)} />
                        Archive on Publish
                    </label>
                    <Link href="/admin/posts" className="btn">Cancel</Link>
                    <button type="submit" className="btn" disabled={saving}>
                        {saving ? "Saving..." : "Save Post"}
                    </button>
                </div>
            </div>

            <div style={{ display: "flex", gap: 20 }}>
                <div style={{ flex: 1 }}>
                    <label style={{ display: "block", marginBottom: 5 }}>Title</label>
                    <input style={inputStyle} required value={title} onChange={e => setTitle(e.target.value)} />

                    {isNew && (
                        <>
                            <label style={{ display: "block", marginBottom: 5 }}>URL Slug</label>
                            <input style={inputStyle} required value={slug} onChange={e => setSlug(e.target.value.replace(/\s+/g, '-').toLowerCase())} placeholder="my-awesome-post" />
                        </>
                    )}

                    <label style={{ display: "block", marginBottom: 5 }}>Date (YYYY-MM-DD)</label>
                    <input style={inputStyle} required type="date" value={date} onChange={e => setDate(e.target.value)} />

                    <label style={{ display: "block", marginBottom: 5 }}>Categories (comma separated)</label>
                    <input style={inputStyle} value={categories} onChange={e => setCategories(e.target.value)} placeholder="tech, personal" />
                    
                    <label style={{ display: "block", marginBottom: 5 }}>Hidden SEO Keywords</label>
                    <div style={{ display: "flex", gap: 10, marginBottom: 15 }}>
                        <input style={{ ...inputStyle, marginBottom: 0 }} value={keywords} onChange={e => setKeywords(e.target.value)} placeholder="react, nextjs, blog" />
                        <button type="button" className="btn" onClick={generateAITags} disabled={generatingTags} title="Generate SEO Tags automatically using Gemini">
                            {generatingTags ? "..." : "AI ✨"}
                        </button>
                    </div>
                </div>
                
                <div style={{ flex: 1 }}>
                    <label style={{ display: "block", marginBottom: 5 }}>Summary (for post lists)</label>
                    <textarea style={{ ...inputStyle, minHeight: 90 }} value={summary} onChange={e => setSummary(e.target.value)} />

                    <label style={{ display: "block", marginBottom: 5 }}>Cover Image URL</label>
                    <div style={{ display: "flex", gap: 10, marginBottom: 15 }}>
                        <input style={{ ...inputStyle, marginBottom: 0 }} value={image} onChange={e => setImage(e.target.value)} />
                        <label className="btn" style={{ cursor: "pointer", whiteSpace: "nowrap" }}>
                            Upload Cover
                            <input type="file" hidden accept="image/*" onChange={handleCoverUpload} />
                        </label>
                    </div>
                </div>
            </div>

            <RichEditor value={content} onChange={setContent} />
        </form>
    );
}
