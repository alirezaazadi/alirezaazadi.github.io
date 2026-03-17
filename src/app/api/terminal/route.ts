import { NextResponse } from "next/server";
import { getAllPostsMeta } from "@/lib/posts";
import { getFavorites } from "@/lib/favorites";
import { siteConfig } from "../../../../site.config";

export const revalidate = 300; // Cache for 5 minutes

export async function GET() {
    try {
        const [posts, favorites] = await Promise.all([
            getAllPostsMeta(),
            getFavorites(),
        ]);

        const fs: Record<string, unknown> = {
            posts: posts.map((p) => ({
                slug: p.slug,
                title: p.title,
                summary: p.summary,
                date: p.date,
                categories: p.categories,
            })),
            favorites: favorites || { books: [], music: [], podcasts: [], movies: [], playlists: [], magazines: [] },
            about: siteConfig.aboutMe,
        };

        return NextResponse.json(fs, {
            headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
        });
    } catch {
        return NextResponse.json({ error: "Failed to load data" }, { status: 500 });
    }
}
