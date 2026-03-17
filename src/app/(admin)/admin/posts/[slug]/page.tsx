"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { Bold, Italic, List, Heading, Quote, Code, Link2 } from "lucide-react";

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
    const [image, setImage] = useState("");
    const [content, setContent] = useState("");
    const [viewMode, setViewMode] = useState<"write" | "preview">("write");

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
            image,
            content
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

    async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>, isCover: boolean) {
        if (!e.target.files?.[0]) return;
        
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", "post");

        try {
            const res = await fetch("/api/admin/upload", {
                method: "POST",
                body: formData
            });
            const data = await res.json();
            
            if (res.ok) {
                if (isCover) {
                    setImage(data.url);
                } else {
                    const newText = `\n![Image](${data.url})\n`;
                    insertAtCursor(newText);
                }
            } else {
                alert("Upload failed: " + data.error);
            }
        } catch (err) {
            alert("Upload failed.");
        }
        
        e.target.value = '';
    }

    function insertAtCursor(textToInsert: string) {
        const textarea = document.getElementById("md-editor") as HTMLTextAreaElement;
        if (!textarea) {
            setContent(prev => prev + textToInsert);
            return;
        }

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const before = text.substring(0, start);
        const after = text.substring(end);

        setContent(before + textToInsert + after);
        
        queueMicrotask(() => {
            textarea.focus();
            textarea.setSelectionRange(start + textToInsert.length, start + textToInsert.length);
        });
    }

    function insertFormatting(prefix: string, suffix: string, defaultText = "text") {
        const textarea = document.getElementById("md-editor") as HTMLTextAreaElement;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;

        const before = text.substring(0, start);
        const selected = text.substring(start, end) || defaultText;
        const after = text.substring(end);

        const newText = before + prefix + selected + suffix + after;
        setContent(newText);
        
        queueMicrotask(() => {
            textarea.focus();
            textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
        });
    }

    if (loading) return <div>Loading...</div>;

    const inputStyle = { width: "100%", padding: "8px", marginBottom: "15px", borderRadius: "4px", border: "1px solid var(--border-color)", background: "var(--bg-secondary)", color: "var(--fg-primary)" };

    const ToolbarButton = ({ icon: Icon, onClick, title }: any) => (
        <button type="button" onClick={onClick} title={title} style={{ padding: "6px", background: "transparent", border: "1px solid transparent", cursor: "pointer", color: "var(--fg-primary)", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }} onMouseOver={e => e.currentTarget.style.background = "var(--bg-secondary)"} onMouseOut={e => e.currentTarget.style.background = "transparent"}>
            <Icon size={16} />
        </button>
    );

    return (
        <form onSubmit={handleSave} style={{ maxWidth: 800, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h1>{isNew ? "New Post" : "Edit Post"}</h1>
                <div style={{ display: "flex", gap: 10 }}>
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
                </div>
                
                <div style={{ flex: 1 }}>
                    <label style={{ display: "block", marginBottom: 5 }}>Summary (for post lists)</label>
                    <textarea style={{ ...inputStyle, minHeight: 90 }} value={summary} onChange={e => setSummary(e.target.value)} />

                    <label style={{ display: "block", marginBottom: 5 }}>Cover Image URL</label>
                    <div style={{ display: "flex", gap: 10, marginBottom: 15 }}>
                        <input style={{ ...inputStyle, marginBottom: 0 }} value={image} onChange={e => setImage(e.target.value)} />
                        <label className="btn" style={{ cursor: "pointer", whiteSpace: "nowrap" }}>
                            Upload Cover
                            <input type="file" hidden accept="image/*" onChange={(e) => handleImageUpload(e, true)} />
                        </label>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: 20, border: "1px solid var(--border-color)", borderRadius: 8, overflow: "hidden" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-secondary)", borderBottom: "1px solid var(--border-color)", padding: "8px 15px" }}>
                    
                    {/* View Toggles */}
                    <div style={{ display: "flex", gap: 5 }}>
                        <button type="button" className="btn" onClick={() => setViewMode("write")} style={{ padding: "4px 12px", border: viewMode === "write" ? "1px solid var(--fg-primary)" : "1px solid transparent", opacity: viewMode === "write" ? 1 : 0.6 }}>
                            Write
                        </button>
                        <button type="button" className="btn" onClick={() => setViewMode("preview")} style={{ padding: "4px 12px", border: viewMode === "preview" ? "1px solid var(--fg-primary)" : "1px solid transparent", opacity: viewMode === "preview" ? 1 : 0.6 }}>
                            Preview
                        </button>
                    </div>

                    {/* Rich Formatting Toolbar */}
                    {viewMode === "write" && (
                        <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
                            <ToolbarButton icon={Heading} title="Heading" onClick={() => insertFormatting("### ", "")} />
                            <ToolbarButton icon={Bold} title="Bold" onClick={() => insertFormatting("**", "**")} />
                            <ToolbarButton icon={Italic} title="Italic" onClick={() => insertFormatting("*", "*")} />
                            <div style={{ width: 1, height: 16, background: "var(--border-color)", margin: "0 4px" }} />
                            <ToolbarButton icon={Link2} title="Link" onClick={() => insertFormatting("[", "](url)", "link")} />
                            <ToolbarButton icon={Quote} title="Quote" onClick={() => insertFormatting("> ", "")} />
                            <ToolbarButton icon={Code} title="Code" onClick={() => insertFormatting("`", "`")} />
                            <ToolbarButton icon={List} title="List" onClick={() => insertFormatting("- ", "")} />
                            <div style={{ width: 1, height: 16, background: "var(--border-color)", margin: "0 4px" }} />
                            <label style={{ display: "flex", alignItems: "center", cursor: "pointer", fontSize: 12, padding: "4px 8px", background: "rgba(0,0,0,0.2)", borderRadius: 4, marginLeft: 4 }}>
                                Insert Image
                                <input type="file" hidden accept="image/*" onChange={(e) => handleImageUpload(e, false)} />
                            </label>
                        </div>
                    )}
                </div>
                
                {viewMode === "write" ? (
                    <textarea 
                        id="md-editor"
                        style={{ width: "100%", minHeight: 600, padding: 15, fontFamily: "monospace", fontSize: 14, border: "none", background: "transparent", color: "var(--fg-primary)", outline: "none", resize: "vertical" }} 
                        required 
                        value={content} 
                        onChange={e => setContent(e.target.value)} 
                        placeholder="Write your markdown here..."
                    />
                ) : (
                    <div style={{ minHeight: 600, padding: 25, background: "var(--bg-primary)" }}>
                        <MarkdownRenderer content={content} slug={slug || slugParam} />
                    </div>
                )}
            </div>
        </form>
    );
}
