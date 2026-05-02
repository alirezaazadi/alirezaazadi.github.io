import { getPostBySlug } from '@/lib/posts';
import { getLanguage } from "@/lib/i18n";
import { PostPageClient } from '@/components/PostPageClient';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'About | Alireza Azadi',
    description: 'About Alireza Azadi - Software Engineer and Writer',
};

export default async function AboutPage() {
    const lang = await getLanguage();
    const post = await getPostBySlug('about', lang);

    if (!post) {
        notFound();
    }

    return <PostPageClient post={post} currentLang={lang} />;
}
