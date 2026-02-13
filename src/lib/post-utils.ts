/**
 * Client-safe post utility functions.
 * These can be imported in both server and client components.
 */

export interface Post {
    slug: string;
    title: string;
    summary: string;
    date: string;
    categories: string[];
    image: string;
    readingTime: string; // e.g. "5 min read"
    body: string;
}

export interface PostMeta {
    slug: string;
    title: string;
    summary: string;
    date: string;
    categories: string[];
    image: string;
    readingTime: string;
}

/**
 * Calculates reading time for a given text
 */
export function calculateReadingTime(content: string): string {
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
}

/**
 * Extracts all unique categories from posts (normalized to Title Case)
 */
export function extractCategories(posts: PostMeta[]): string[] {
    const cats = new Set<string>();
    posts.forEach((p) => {
        p.categories.forEach((c) => {
            // Normalize to Title Case to ensure case-insensitivity visually
            // e.g. "tech" -> "Tech", "Next.js" -> "Next.js" (we might want just capitalization)
            // For strict case insensitivity, we usually store as lowercase in a map or just capitalize first letter.
            // Let's standardise on "Capitalize First Letter" for now, or just trust the input if we simply want to merge them.
            // user asked "categories be case insensitive". This usually means "tech" and "Tech" should be treated as the same category.
            // We will normalize everything to Title Case for display and storage.
            const normalized = c.trim(); // We'll rely on the parser to normalize.
            cats.add(normalized);
        });
    });
    return Array.from(cats).sort();
}

/**
 * Extracts dates that have posts (for calendar highlighting)
 */
export function extractPostDates(posts: PostMeta[]): Record<string, number> {
    const dateCounts: Record<string, number> = {};
    posts.forEach((p) => {
        if (p.date) {
            dateCounts[p.date] = (dateCounts[p.date] || 0) + 1;
        }
    });
    return dateCounts;
}

/**
 * Search posts by title and body text
 */
export function searchPosts(posts: Post[], query: string): Post[] {
    const q = query.toLowerCase().trim();
    if (!q) return posts;
    return posts.filter(
        (p) =>
            p.title.toLowerCase().includes(q) ||
            p.body.toLowerCase().includes(q) ||
            p.summary.toLowerCase().includes(q)
    );
}

/**
 * Filter posts by category
 */
export function filterByCategory(posts: Post[], category: string): Post[] {
    if (!category) return posts;
    return posts.filter((p) =>
        p.categories.map((c) => c.toLowerCase()).includes(category.toLowerCase())
    );
}

/**
 * Filter posts by date
 */
export function filterByDate(posts: Post[], date: string): Post[] {
    if (!date) return posts;
    return posts.filter((p) => p.date === date);
}

/**
 * Paginate posts
 */
export function paginatePosts(
    posts: Post[],
    page: number,
    perPage: number
): { posts: Post[]; totalPages: number; currentPage: number } {
    const totalPages = Math.max(1, Math.ceil(posts.length / perPage));
    const currentPage = Math.max(1, Math.min(page, totalPages));
    const start = (currentPage - 1) * perPage;
    return {
        posts: posts.slice(start, start + perPage),
        totalPages,
        currentPage,
    };
}
