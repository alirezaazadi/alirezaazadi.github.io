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
function parsePost(filename: string, raw: string): Post {
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
    };
}

/**
 * Parses only frontmatter metadata (no body) — much cheaper for listing pages
 */
function parsePostMeta(filename: string, raw: string): PostMeta {
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
    };
}

/**
 * Fetches and parses all posts from GitHub, sorted by date (newest first)
 */
export async function getAllPosts(): Promise<Post[]> {
    const files = await fetchPostsList();

    const posts = await Promise.all(
        files.map(async (file) => {
            const raw = await fetchPostContent(file.name);
            return parsePost(file.name, raw);
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
export async function getAllPostsMeta(): Promise<PostMeta[]> {
    const files = await fetchPostsList();

    const metas = await Promise.all(
        files.map(async (file) => {
            const raw = await fetchPostContent(file.name);
            return parsePostMeta(file.name, raw);
        })
    );

    return metas
        .filter((meta) => !meta.hidden)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Fetches a single post by slug
 */
export async function getPostBySlug(slug: string): Promise<Post | null> {
    try {
        const raw = await fetchPostContent(`${slug}.md`);
        return parsePost(`${slug}.md`, raw);
    } catch {
        return null;
    }
}
