"use client";

import { useState } from "react";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { Bold, Italic, List, Heading, Quote, Code, Link2 } from "lucide-react";

interface RichEditorProps {
    value: string;
    onChange: (value: string) => void;
    id?: string;
}

export function RichEditor({ value, onChange, id = "md-editor" }: RichEditorProps) {
    const [viewMode, setViewMode] = useState<"write" | "preview">("write");

    async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
        if (!e.target.files?.length) return;
        
        let insertedMarkdown = "";
        for (let i = 0; i < e.target.files.length; i++) {
            const file = e.target.files[i];
            const formData = new FormData();
            formData.append("file", file);
            formData.append("type", "post");
            try {
                const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
                const data = await res.json();
                if (res.ok) {
                    insertedMarkdown += `\n![Image](${data.url})\n`;
                } else {
                    alert(`Upload failed for ${file.name}: ${data.error}`);
                }
            } catch (err) {
                alert(`Upload failed for ${file.name}`);
            }
        }
        if (insertedMarkdown) {
            insertAtCursor(insertedMarkdown);
        }
        e.target.value = '';
    }

    function insertAtCursor(textToInsert: string) {
        const textarea = document.getElementById(id) as HTMLTextAreaElement;
        if (!textarea) {
            onChange(value + textToInsert);
            return;
        }

        textarea.focus();
        const success = document.execCommand('insertText', false, textToInsert);
        
        if (!success) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const before = textarea.value.substring(0, start);
            const after = textarea.value.substring(end);

            onChange(before + textToInsert + after);
            
            queueMicrotask(() => {
                textarea.focus();
                textarea.setSelectionRange(start + textToInsert.length, start + textToInsert.length);
            });
        }
    }

    function insertFormatting(prefix: string, suffix: string, defaultText = "text") {
        const textarea = document.getElementById(id) as HTMLTextAreaElement;
        if (!textarea) return;

        textarea.focus();
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selected = textarea.value.substring(start, end) || defaultText;
        const newText = prefix + selected + suffix;

        const success = document.execCommand('insertText', false, newText);

        if (!success) {
            const before = textarea.value.substring(0, start);
            const after = textarea.value.substring(end);
            onChange(before + newText + after);
        }
        
        queueMicrotask(() => {
            textarea.focus();
            textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
        });
    }

    const ToolbarButton = ({ icon: Icon, onClick, title }: any) => (
        <button type="button" onClick={onClick} title={title} style={{ padding: "6px", background: "transparent", border: "1px solid transparent", cursor: "pointer", color: "var(--fg-primary)", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }} onMouseOver={e => e.currentTarget.style.background = "var(--bg-secondary)"} onMouseOut={e => e.currentTarget.style.background = "transparent"}>
            <Icon size={16} />
        </button>
    );

    return (
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
                            <input type="file" hidden multiple accept="image/*" onChange={handleImageUpload} />
                        </label>
                    </div>
                )}
            </div>
            
            {viewMode === "write" ? (
                <textarea 
                    id={id}
                    style={{ width: "100%", minHeight: 600, padding: 15, fontSize: 14, border: "none", background: "transparent", color: "var(--fg-primary)", outline: "none", resize: "vertical" }} 
                    required 
                    value={value} 
                    onChange={e => onChange(e.target.value)} 
                    placeholder="Write your markdown here..."
                    dir="auto"
                />
            ) : (
                <div style={{ minHeight: 600, padding: 25, background: "var(--bg-primary)" }} dir="auto">
                    <MarkdownRenderer content={value} slug="preview-content" />
                </div>
            )}
        </div>
    );
}
