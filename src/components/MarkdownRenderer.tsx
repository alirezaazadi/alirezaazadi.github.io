"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import { getDirection } from "@/lib/rtl";
import type { Components } from "react-markdown";
import { ExpandableImage } from "@/components/ExpandableImage";
import { MermaidChart } from "@/components/MermaidChart";
import { siteConfig } from "../../site.config";

interface MarkdownRendererProps {
    content: string;
    adhdMode?: boolean;
    slug?: string;
}

/**
 * Parse video embed syntax: {% video URL %}
 * Parse spotify embed syntax: {% spotify URL %}
 * Parse Obsidian-style image sizing: ![alt](url|WxH) or ![alt](url|xH)  
 */
function preprocessContent(md: string): string {
    // Replace {% video URL %} with HTML
    let processed = md.replace(
        /\{%\s*video\s+(https?:\/\/[^\s%]+)\s*%\}/g,
        (_, url: string) => {
            const embedUrl = getVideoEmbedUrl(url);
            if (embedUrl) {
                return `<div class="video-embed"><iframe src="${embedUrl}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
            }
            return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
        }
    );

    // Replace {% spotify URL %} with Spotify embed
    processed = processed.replace(
        /\{%\s*spotify\s+(https?:\/\/[^\s%]+)\s*%\}/g,
        (_, url: string) => {
            const embedUrl = getSpotifyEmbedUrl(url);
            if (embedUrl) {
                return `<div class="spotify-embed"><iframe src="${embedUrl}" width="100%" height="352" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe></div>`;
            }
            return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
        }
    );

    // Handle Obsidian-style image syntax: ![[path|dimensions]]
    // Dimensions can be: WxH, xH, or W
    processed = processed.replace(
        /!\[\[([^\]|]+)\|([^\]]+)\]\]/g,
        (_, path: string, dims: string) => {
            const { width, height } = parseDimensions(dims);
            const style = buildSizeStyle(width, height);
            return `<img src="${path.trim()}" style="${style}" />`;
        }
    );

    // Handle standard markdown images with size parameter: ![alt](url|dimensions)
    processed = processed.replace(
        /!\[([^\]]*)\]\(([^)|]+)\|([^)]+)\)/g,
        (_, alt: string, url: string, dims: string) => {
            const { width, height } = parseDimensions(dims);
            const style = buildSizeStyle(width, height);
            return `<img src="${url.trim()}" alt="${alt}" style="${style}" />`;
        }
    );

    return processed;
}

function parseDimensions(dims: string): { width: string | null; height: string | null } {
    const d = dims.trim();

    // xH format (height only, e.g. "x100")
    const xMatch = d.match(/^x(\d+)$/);
    if (xMatch) return { width: null, height: `${xMatch[1]}px` };

    // WxH format (e.g. "200x100" or "200*100")
    const wxhMatch = d.match(/^(\d+)\s*[x*×]\s*(\d+)$/i);
    if (wxhMatch) return { width: `${wxhMatch[1]}px`, height: `${wxhMatch[2]}px` };

    // W only (e.g. "200")
    const wMatch = d.match(/^(\d+)$/);
    if (wMatch) return { width: `${wMatch[1]}px`, height: null };

    return { width: null, height: null };
}

function buildSizeStyle(width: string | null, height: string | null): string {
    const parts: string[] = [];
    if (width) parts.push(`width: ${width}`);
    if (height) parts.push(`height: ${height}`);
    if (parts.length > 0) parts.push("object-fit: contain");
    return parts.join("; ");
}

function getVideoEmbedUrl(url: string): string | null {
    // YouTube
    const ytMatch = url.match(
        /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]+)/
    );
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;

    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;

    // Aparat (Iranian video platform)
    const aparatMatch = url.match(/aparat\.com\/v\/([\w]+)/);
    if (aparatMatch)
        return `https://www.aparat.com/video/video/embed/videohash/${aparatMatch[1]}/vt/frame`;

    return null;
}

function getSpotifyEmbedUrl(url: string): string | null {
    const match = url.match(
        /open\.spotify\.com\/(track|album|playlist|episode)\/([\w]+)/
    );
    if (match) {
        return `https://open.spotify.com/embed/${match[1]}/${match[2]}?theme=0`;
    }
    return null;
}

function processGalleryChildren(children: any[]) {
    const newChildren: any[] = [];
    let galleryBuffer: any[] = [];

    for (let i = 0; i < children.length; i++) {
        const node = children[i];
        
        let isImageParagraph = false;
        let isDirectImage = false;

        if (node.type === 'element' && node.tagName === 'img') {
            isDirectImage = true;
        } else if (node.type === 'element' && node.tagName === 'p') {
            const hasOnlyImages = node.children && node.children.length > 0 && node.children.every((child: any) => 
                (child.type === 'element' && child.tagName === 'img') || 
                (child.type === 'text' && child.value.trim() === '')
            );
            const hasImage = node.children && node.children.some((child: any) => child.type === 'element' && child.tagName === 'img');
            isImageParagraph = hasOnlyImages && hasImage;
        }

        if (isDirectImage) {
            galleryBuffer.push(node);
        } else if (isImageParagraph) {
            const images = node.children.filter((child: any) => child.type === 'element' && child.tagName === 'img');
            galleryBuffer.push(...images);
        } else if (node.type === 'text' && (node.value || '').trim() === '') {
            if (galleryBuffer.length === 0) {
                newChildren.push(node);
            }
        } else {
            if (galleryBuffer.length > 0) {
                if (galleryBuffer.length === 1) {
                    newChildren.push({
                        type: 'element',
                        tagName: 'div',
                        properties: { className: ['single-image-wrapper'] },
                        children: galleryBuffer
                    });
                } else {
                    newChildren.push({
                        type: 'element',
                        tagName: 'div',
                        properties: { className: ['image-gallery'] },
                        children: galleryBuffer
                    });
                }
                galleryBuffer = [];
            }
            
            if (node.children) {
                node.children = processGalleryChildren(node.children);
            }
            newChildren.push(node);
        }
    }

    if (galleryBuffer.length > 0) {
        if (galleryBuffer.length === 1) {
            newChildren.push({
                type: 'element',
                tagName: 'div',
                properties: { className: ['single-image-wrapper'] },
                children: galleryBuffer
            });
        } else {
            newChildren.push({
                type: 'element',
                tagName: 'div',
                properties: { className: ['image-gallery'] },
                children: galleryBuffer
            });
        }
    }

    return newChildren;
}

function rehypeImageGallery() {
    return (tree: any) => {
        if (tree.children) {
            tree.children = processGalleryChildren(tree.children);
        }
    };
}

export function MarkdownRenderer({ content, adhdMode = false, slug }: MarkdownRendererProps) {
    const processed = preprocessContent(content);
    const dir = getDirection(content);

    const components: Components = {
        a: ({ href, children, ...props }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
                {children}
            </a>
        ),
        code: ({ className, children, ...props }) => {
            if (className?.includes("language-mermaid")) {
                // Extract plain text from children (may be nested nodes after rehype)
                const extractText = (node: unknown): string => {
                    if (typeof node === "string") return node;
                    if (Array.isArray(node)) return node.map(extractText).join("");
                    if (node && typeof node === "object" && "props" in (node as any)) {
                        return extractText((node as any).props?.children);
                    }
                    return String(node ?? "");
                };
                return <MermaidChart chart={extractText(children)} />;
            }
            return (
                <code className={className} {...props}>
                    {children}
                </code>
            );
        },
        img: ({ src, alt, style, ...props }) => {
            let finalSrc = (src as string) || "";
            if (slug) {
                if (finalSrc.startsWith("./")) {
                    const cleanPath = finalSrc.replace(/^\.\//, "");
                    finalSrc = `/post/${slug}/${cleanPath}`;
                } else if (finalSrc.startsWith("media/")) {
                    finalSrc = `/post/${slug}/${finalSrc}`;
                }
            }

            let finalStyle = style;
            const dw = siteConfig.defaultImageWidth;
            if (dw > 0 && !style) {
                finalStyle = { maxWidth: `${dw}px`, height: "auto" };
            }

            return (
                <ExpandableImage
                    src={finalSrc}
                    alt={alt as string}
                    style={finalStyle}
                    {...props}
                />
            );
        }
    };

    return (
        <div className={`markdown-body ${adhdMode ? "adhd-friendly" : ""}`} dir={dir}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeImageGallery, [rehypeHighlight, { ignoreMissing: true }]]}
                components={components}
            >
                {processed}
            </ReactMarkdown>
        </div>
    );
}
