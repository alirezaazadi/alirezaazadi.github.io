/**
 * Server-only post functions.
 * These import from github.ts (which uses fs) and must only be used in server components.
 */
import "server-only";
import matter from "gray-matter";
import { fetchPostsList, fetchPostContent } from "./github";
import type { Post, PostMeta } from "./post-utils";
import { calculateReadingTime } from "./post-utils";

export type { Post, PostMeta } from "./post-utils";

/**
 * Parses a markdown string with frontmatter into a Post object
 */
function parsePost(filename: string, raw: string, availableLanguages?: string[]): Post {
    const { data, content } = matter(raw);
    return {
        slug: filename.replace(/\.md$/, ""),
        title: data.title || "Untitled",
        summary: data.summary || "",
        date: data.date ? new Date(data.date).toISOString().split("T")[0] : "",
        categories: (data.categories || []).map((c: string) =>
            c.charAt(0).toUpperCase() + c.slice(1).toLowerCase()
        ),
        keywords: data.keywords || [],
        image: data.image || "",
        body: content,
        readingTime: calculateReadingTime(content),
        hidden: data.hidden || false,
        availableLanguages: availableLanguages || ["fa"],
    };
}

/**
 * Parses only frontmatter metadata (no body) — much cheaper for listing pages
 */
function parsePostMeta(filename: string, raw: string, availableLanguages?: string[]): PostMeta {
    const { data, content } = matter(raw); // We need content for reading time
    return {
        slug: filename.replace(/\.md$/, ""),
        title: data.title || "Untitled",
        summary: data.summary || "",
        date: data.date ? new Date(data.date).toISOString().split("T")[0] : "",
        categories: (data.categories || []).map((c: string) =>
            c.charAt(0).toUpperCase() + c.slice(1).toLowerCase()
        ),
        keywords: data.keywords || [],
        image: data.image || "",
        readingTime: calculateReadingTime(content),
        hidden: data.hidden || false,
        availableLanguages: availableLanguages || ["fa"],
    };
}

/**
 * Fetches and parses all posts from GitHub, sorted by date (newest first)
 */
export async function getAllPosts(lang: string = "fa"): Promise<Post[]> {
    const files = await fetchPostsList();

    const posts = await Promise.all(
        files.map(async (file) => {
            const raw = await fetchPostContent(file.name, lang);
            return parsePost(file.name, raw, file.availableLanguages);
        })
    );

    return posts
        .filter((post) => !post.hidden)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Fetches all post metadata (without body) — used for listing/pagination.
 * Much lighter than getAllPosts since we still parse frontmatter but skip body content.
 */
export async function getAllPostsMeta(includeHidden = false, lang: string = "fa"): Promise<PostMeta[]> {
    const files = await fetchPostsList();

    const metas = await Promise.all(
        files.map(async (file) => {
            const raw = await fetchPostContent(file.name, lang);
            return parsePostMeta(file.name, raw, file.availableLanguages);
        })
    );

    return metas
        .filter((meta) => includeHidden || !meta.hidden)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

import path from "path";
import fs from "fs";

/**
 * Fetches a single post by slug
 */
export async function getPostBySlug(slug: string, lang: string = "fa"): Promise<Post | null> {
    try {
        const raw = await fetchPostContent(`${slug}.md`, lang);
        
        const availableLanguages = ["fa"];
        const POSTS_DIR = path.join(process.cwd(), "content", "posts");
        
        // Check for flat file translation
        const langFlatPath = path.join(POSTS_DIR, `${slug}_en.md`);
        // Check for nested folder translation
        const langNestedPath = path.join(POSTS_DIR, slug, `index_en.md`);
        
        if (fs.existsSync(langFlatPath) || fs.existsSync(langNestedPath)) {
            availableLanguages.push("en");
        }

        return parsePost(`${slug}.md`, raw, availableLanguages);
    } catch {
        return null;
    }
}
