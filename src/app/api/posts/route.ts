import { NextRequest, NextResponse } from "next/server";
import { getAllPostsMeta } from "@/lib/posts";
import type { PostMeta } from "@/lib/post-utils";

interface PaginatedResponse {
    posts: PostMeta[];
    page: number;
    totalPages: number;
    totalPosts: number;
    hasNext: boolean;
    hasPrev: boolean;
}

/**
 * GET /api/posts?page=1&perPage=6&category=tech&q=search
 *
 * Returns paginated post metadata (no body content).
 * Cached for 5 minutes at the CDN level (stale-while-revalidate for 1 hour).
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = request.nextUrl;
        const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
        const perPage = Math.min(20, Math.max(1, parseInt(searchParams.get("perPage") || "6", 10)));
        const category = searchParams.get("category") || "";
        const query = searchParams.get("q") || "";
        const date = searchParams.get("date") || "";

        let posts = await getAllPostsMeta();

        // Apply filters
        if (category) {
            posts = posts.filter((p) =>
                p.categories.some((c) => c.toLowerCase() === category.toLowerCase())
            );
        }

        if (query) {
            const q = query.toLowerCase();
            posts = posts.filter(
                (p) =>
                    p.title.toLowerCase().includes(q) ||
                    p.summary.toLowerCase().includes(q)
            );
        }

        if (date) {
            posts = posts.filter((p) => p.date === date);
        }

        // Paginate
        const totalPosts = posts.length;
        const totalPages = Math.max(1, Math.ceil(totalPosts / perPage));
        const currentPage = Math.max(1, Math.min(page, totalPages));
        const start = (currentPage - 1) * perPage;
        const paginatedPosts = posts.slice(start, start + perPage);

        const response: PaginatedResponse = {
            posts: paginatedPosts,
            page: currentPage,
            totalPages,
            totalPosts,
            hasNext: currentPage < totalPages,
            hasPrev: currentPage > 1,
        };

        return NextResponse.json(response, {
            headers: {
                // Cache at CDN for 5 minutes, serve stale for up to 1 hour while revalidating
                "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
            },
        });
    } catch (error) {
        console.error("Posts API error:", error);
        return NextResponse.json(
            { error: "Failed to fetch posts" },
            { status: 500 }
        );
    }
}
