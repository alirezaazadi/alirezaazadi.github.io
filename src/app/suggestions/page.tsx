import { getPostBySlug } from '@/lib/posts';
import { PostPageClient } from '@/components/PostPageClient';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Suggestions | Alireza Azadi',
    description: 'My personal recommendations for books, movies, podcasts, and articles.',
};

export default async function SuggestionsPage() {
    const post = await getPostBySlug('suggestions');

    if (!post) {
        notFound();
    }

    return <PostPageClient post={post} />;
}
