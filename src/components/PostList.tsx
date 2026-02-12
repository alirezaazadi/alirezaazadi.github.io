"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { PostMeta } from "@/lib/post-utils";
import {
    extractCategories,
    extractPostDates,
} from "@/lib/post-utils";
import { siteConfig } from "../../site.config";
import { PostCard } from "./PostCard";
import { SearchBar } from "./SearchBar";
import { FilterDropdown } from "./FilterDropdown";
import { Pagination } from "./Pagination";
import { FileText, Loader } from "lucide-react";

interface PostListProps {
    /** Initial posts from server-side rendering (first page, metadata only) */
    initialPosts: PostMeta[];
    /** All categories (extracted server-side for SEO) */
    allCategories: string[];
    /** All post dates (extracted server-side) */
    allDates: Record<string, number>;
    /** Total number of posts available */
    totalPosts: number;
}

interface PageCache {
    [key: string]: {
        posts: PostMeta[];
        totalPages: number;
        totalPosts: number;
    };
}

function buildCacheKey(page: number, category: string, query: string, date: string): string {
    return `${page}:${category}:${query}:${date}`;
}

export function PostList({ initialPosts, allCategories, allDates, totalPosts }: PostListProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [query, setQuery] = useState(searchParams.get("q") || "");
    const [category, setCategory] = useState(searchParams.get("category") || "");
    const [date, setDate] = useState(searchParams.get("date") || "");
    const [page, setPage] = useState(
        parseInt(searchParams.get("page") || "1", 10)
    );
    const [loading, setLoading] = useState(false);
    const [displayPosts, setDisplayPosts] = useState<PostMeta[]>(initialPosts);
    const [totalPages, setTotalPages] = useState(
        Math.max(1, Math.ceil(totalPosts / siteConfig.postsPerPage))
    );

    // Page cache to avoid refetching
    const cacheRef = useRef<PageCache>({});

    // Seed cache with initial server data
    useEffect(() => {
        const key = buildCacheKey(1, "", "", "");
        cacheRef.current[key] = {
            posts: initialPosts,
            totalPages: Math.max(1, Math.ceil(totalPosts / siteConfig.postsPerPage)),
            totalPosts,
        };
    }, [initialPosts, totalPosts]);

    /**
     * Fetch posts from the paginated API
     */
    const fetchPosts = useCallback(async (
        p: number, cat: string, q: string, d: string, skipCache = false
    ): Promise<{ posts: PostMeta[]; totalPages: number; totalPosts: number } | null> => {
        const key = buildCacheKey(p, cat, q, d);

        // Return cached data if available
        if (!skipCache && cacheRef.current[key]) {
            return cacheRef.current[key];
        }

        try {
            const params = new URLSearchParams();
            params.set("page", String(p));
            params.set("perPage", String(siteConfig.postsPerPage));
            if (cat) params.set("category", cat);
            if (q) params.set("q", q);
            if (d) params.set("date", d);

            const res = await fetch(`/api/posts?${params.toString()}`);
            if (!res.ok) throw new Error("Failed to fetch");

            const data = await res.json();
            const result = {
                posts: data.posts,
                totalPages: data.totalPages,
                totalPosts: data.totalPosts,
            };

            // Cache the result
            cacheRef.current[key] = result;
            return result;
        } catch (error) {
            console.error("Error fetching posts:", error);
            return null;
        }
    }, []);

    /**
     * Prefetch the next page in the background
     */
    const prefetchNextPage = useCallback((
        currentPage: number, cat: string, q: string, d: string, maxPages: number
    ) => {
        if (currentPage < maxPages) {
            // Fire and forget — prefetch next page silently
            fetchPosts(currentPage + 1, cat, q, d);
        }
    }, [fetchPosts]);

    /**
     * Load a specific page (from cache or API)
     */
    const loadPage = useCallback(async (
        p: number, cat: string, q: string, d: string
    ) => {
        const key = buildCacheKey(p, cat, q, d);

        // If cached, use immediately
        if (cacheRef.current[key]) {
            const cached = cacheRef.current[key];
            setDisplayPosts(cached.posts);
            setTotalPages(cached.totalPages);
            prefetchNextPage(p, cat, q, d, cached.totalPages);
            return;
        }

        // Otherwise fetch from API
        setLoading(true);
        const result = await fetchPosts(p, cat, q, d);
        setLoading(false);

        if (result) {
            setDisplayPosts(result.posts);
            setTotalPages(result.totalPages);
            prefetchNextPage(p, cat, q, d, result.totalPages);
        }
    }, [fetchPosts, prefetchNextPage]);

    // Prefetch next page on initial load
    useEffect(() => {
        prefetchNextPage(1, "", "", "", totalPages);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const updateUrl = useCallback(
        (params: Record<string, string>) => {
            const sp = new URLSearchParams(searchParams.toString());
            Object.entries(params).forEach(([k, v]) => {
                if (v) sp.set(k, v);
                else sp.delete(k);
            });
            router.push(`?${sp.toString()}`, { scroll: false });
        },
        [router, searchParams]
    );

    const handleSearch = useCallback(
        (q: string) => {
            setQuery(q);
            setPage(1);
            updateUrl({ q, page: "", category, date });
            loadPage(1, category, q, date);
        },
        [updateUrl, category, date, loadPage]
    );

    const handleCategory = useCallback(
        (c: string) => {
            setCategory(c);
            setPage(1);
            updateUrl({ category: c, page: "", q: query, date });
            loadPage(1, c, query, date);
        },
        [updateUrl, query, date, loadPage]
    );

    const handleDate = useCallback(
        (d: string) => {
            setDate(d);
            setPage(1);
            updateUrl({ date: d, page: "", q: query, category });
            loadPage(1, category, query, d);
        },
        [updateUrl, query, category, loadPage]
    );

    const handlePage = useCallback(
        (p: number) => {
            setPage(p);
            updateUrl({ page: p > 1 ? String(p) : "" });
            loadPage(p, category, query, date);
            window.scrollTo({ top: 0, behavior: "smooth" });
        },
        [updateUrl, category, query, date, loadPage]
    );

    return (
        <div>
            <div className="search-filter-row">
                <SearchBar value={query} onChange={handleSearch} />
                <FilterDropdown
                    categories={allCategories}
                    selectedCategory={category}
                    onCategorySelect={handleCategory}
                    postDates={allDates}
                    selectedDate={date}
                    onDateSelect={handleDate}
                />
            </div>

            {loading ? (
                <div className="empty-state">
                    <Loader size={24} className="spin" />
                    <p>loading posts...</p>
                </div>
            ) : displayPosts.length > 0 ? (
                <>
                    <div className="posts-grid">
                        {displayPosts.map((post) => (
                            <PostCard key={post.slug} post={post} />
                        ))}
                    </div>
                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={handlePage}
                    />
                </>
            ) : (
                <div className="empty-state">
                    <div className="empty-state-icon">
                        <FileText size={48} strokeWidth={1} />
                    </div>
                    <p>no posts found</p>
                    {(query || category || date) && (
                        <button
                            className="btn"
                            style={{ marginTop: 12 }}
                            onClick={() => {
                                setQuery("");
                                setCategory("");
                                setDate("");
                                setPage(1);
                                setDisplayPosts(initialPosts);
                                setTotalPages(Math.max(1, Math.ceil(totalPosts / siteConfig.postsPerPage)));
                                router.push("/", { scroll: false });
                            }}
                        >
                            clear filters
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
