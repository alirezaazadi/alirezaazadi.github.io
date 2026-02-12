import { getPostBySlug, getAllPosts } from "@/lib/posts";
import { PostPageClient } from "@/components/PostPageClient";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { siteConfig } from "../../../../site.config";

// Use ISR: revalidate every 5 minutes for CDN caching
export const revalidate = 300;

interface PostPageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({
    params,
}: PostPageProps): Promise<Metadata> {
    const { slug } = await params;
    const post = await getPostBySlug(slug);
    if (!post) return { title: "Post Not Found" };

    const postUrl = `${siteConfig.url}/post/${slug}`;
    const description = post.summary || `${post.body.slice(0, 160)}...`;

    return {
        title: post.title,
        description,
        openGraph: {
            title: post.title,
            description,
            url: postUrl,
            siteName: siteConfig.title,
            type: "article",
            publishedTime: post.date,
            authors: [siteConfig.author],
            ...(post.image ? { images: [{ url: post.image, width: 1200, height: 630, alt: post.title }] } : {}),
        },
        twitter: {
            card: post.image ? "summary_large_image" : "summary",
            title: post.title,
            description,
            ...(post.image ? { images: [post.image] } : {}),
        },
        alternates: {
            canonical: postUrl,
        },
    };
}

export default async function PostPage({ params }: PostPageProps) {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
        notFound();
    }

    return <PostPageClient post={post} />;
}
