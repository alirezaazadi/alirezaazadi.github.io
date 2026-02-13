import { getPostBySlug } from '@/lib/posts';
import { PostPageClient } from '@/components/PostPageClient';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'About | Alireza Azadi',
    description: 'About Alireza Azadi - Software Engineer and Writer',
};

export default async function AboutPage() {
    const post = await getPostBySlug('about');

    if (!post) {
        notFound();
    }

    return <PostPageClient post={post} />;
}
